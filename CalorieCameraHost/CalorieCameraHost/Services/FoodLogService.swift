//
//  FoodLogService.swift
//  CalorieCameraHost
//
//  Created for Forki food logging integration
//

import Foundation
import CalorieCameraKit

/// Service for saving food logs to Supabase
class FoodLogService {
    static let shared = FoodLogService()
    
    private let supabaseURL: String
    private let supabaseAnonKey: String
    private let userIdKey = "forki-user-id"
    
    private init() {
        // Get Supabase URL and key from environment or Info.plist
        // For now, we'll use environment variables set in Xcode scheme
        var rawURL = ProcessInfo.processInfo.environment["SUPABASE_URL"] ?? ""
        supabaseAnonKey = ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"] ?? ""
        
        // Extract base URL if functions URL is provided
        // Functions URL: https://xxx.supabase.co/functions/v1
        // Base URL: https://xxx.supabase.co
        if rawURL.contains("/functions/v1") {
            if let url = URL(string: rawURL),
               let scheme = url.scheme,
               let host = url.host {
                rawURL = "\(scheme)://\(host)"
            }
        }
        
        supabaseURL = rawURL
        
        if supabaseURL.isEmpty || supabaseAnonKey.isEmpty {
            print("⚠️ [FoodLogService] Supabase credentials not found in environment variables")
            print("   Set SUPABASE_URL (base URL, e.g., https://xxx.supabase.co)")
            print("   Set SUPABASE_ANON_KEY (anon key from Supabase Dashboard)")
        } else {
            print("✅ [FoodLogService] Initialized with Supabase URL: \(supabaseURL)")
        }
    }
    
    /// Get or create unique user ID
    func getOrCreateUserId() -> String {
        let defaults = UserDefaults.standard
        
        if let existingId = defaults.string(forKey: userIdKey) {
            return existingId
        }
        
        // Generate UUID v4
        let newId = UUID().uuidString
        defaults.set(newId, forKey: userIdKey)
        return newId
    }
    
    /// Save food log to Supabase
    func saveFoodLog(from result: CalorieResult) async throws {
        guard !supabaseURL.isEmpty, !supabaseAnonKey.isEmpty else {
            throw FoodLogError.missingCredentials
        }
        
        let userId = getOrCreateUserId()
        let timestamp = ISO8601DateFormatter().string(from: result.timestamp)
        
        // Map CalorieResult to food_logs format
        // For now, we'll save the first item (or aggregate all items)
        guard let firstItem = result.items.first else {
            throw FoodLogError.noItems
        }
        
        // Calculate total weight from volume (using average density of 1.0 g/ml as fallback)
        // In a real implementation, you'd use the actual density from food priors
        let estimatedWeightG = firstItem.volumeML * 1.0 // Simplified - should use actual density
        
        // Use upper bound calories (mean + 2*sigma) as per web app convention
        let upperBoundCalories = Int(result.total.mu + 2 * result.total.sigma)
        
        // Create food log payload
        let foodLog: [String: Any] = [
            "user_id": userId,
            "food_type": firstItem.label,
            "ingredients": [firstItem.label.lowercased()],
            "portion_size": "Standard serving",
            "calories": upperBoundCalories,
            "emoji": getEmoji(for: firstItem.label),
            "logged_at": timestamp,
            "weight_g": Int(estimatedWeightG),
            // Macros are not available in CalorieResult, so we'll leave them null
            // They can be populated later from the analyzer response if needed
        ]
        
        // Make API request to Supabase
        guard let url = URL(string: "\(supabaseURL)/rest/v1/food_logs") else {
            throw FoodLogError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(supabaseAnonKey)", forHTTPHeaderField: "Authorization")
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")
        
        request.httpBody = try JSONSerialization.data(withJSONObject: foodLog)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw FoodLogError.invalidResponse
        }
        
        guard (200..<300).contains(httpResponse.statusCode) else {
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown error"
            print("❌ [FoodLogService] Save failed: \(httpResponse.statusCode) - \(errorBody)")
            throw FoodLogError.serverError(statusCode: httpResponse.statusCode, message: errorBody)
        }
        
        print("✅ [FoodLogService] Food log saved successfully for user: \(userId)")
    }
    
    /// Get emoji for food type
    private func getEmoji(for foodType: String) -> String {
        let lowercased = foodType.lowercased()
        
        // Simple emoji mapping
        if lowercased.contains("chicken") { return "🍗" }
        if lowercased.contains("apple") { return "🍎" }
        if lowercased.contains("banana") { return "🍌" }
        if lowercased.contains("rice") { return "🍚" }
        if lowercased.contains("salad") { return "🥗" }
        if lowercased.contains("pizza") { return "🍕" }
        if lowercased.contains("burger") { return "🍔" }
        if lowercased.contains("fish") { return "🐟" }
        if lowercased.contains("egg") { return "🥚" }
        if lowercased.contains("broccoli") { return "🥦" }
        
        return "🍽️" // Default emoji
    }
}

enum FoodLogError: LocalizedError {
    case missingCredentials
    case noItems
    case invalidURL
    case invalidResponse
    case serverError(statusCode: Int, message: String)
    
    var errorDescription: String? {
        switch self {
        case .missingCredentials:
            return "Supabase credentials not configured"
        case .noItems:
            return "No food items in result"
        case .invalidURL:
            return "Invalid Supabase URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .serverError(let statusCode, let message):
            return "Server error (\(statusCode)): \(message)"
        }
    }
}

