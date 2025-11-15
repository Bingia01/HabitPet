//
//  ContentView.swift
//  CalorieCameraHost
//
//  Created by Wutthichai Upatising on 10/14/25.
//

import SwiftUI
import CalorieCameraKit

struct CameraHostRootView: View {
    @State private var isCameraPresented = false
    @State private var lastResult: CalorieResult?
    @State private var isSaving = false
    @State private var saveError: String?
    @State private var saveSuccess = false

    init() {
        // Debug: Check environment variables
        let env = ProcessInfo.processInfo.environment
        print("🔍 ENV CHECK - ANALYZER_BASE_URL: \(env["ANALYZER_BASE_URL"] ?? "NOT SET")")
        print("🔍 ENV CHECK - SUPABASE_ANON_KEY exists: \(env["SUPABASE_ANON_KEY"] != nil)")
        print("🔍 ENV CHECK - SUPABASE_URL: \(env["SUPABASE_URL"] ?? "NOT SET")")
    }

    var body: some View {
        VStack(spacing: 24) {
            if let result = lastResult {
                Text("Last capture: \(Int(result.total.mu)) kcal ± \(Int(2 * result.total.sigma))")
                    .font(.headline)
                    .multilineTextAlignment(.center)

                if let evidence = result.items.first?.evidence {
                    Text("Evidence: \(evidence.joined(separator: ", "))")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                }
                
                if saveSuccess {
                    Text("✅ Saved to database!")
                        .foregroundColor(.green)
                        .font(.footnote)
                }
                
                if let error = saveError {
                    Text("❌ Error: \(error)")
                        .foregroundColor(.red)
                        .font(.footnote)
                }
            } else {
                Text("No captures yet")
                    .foregroundColor(.secondary)
            }

            Button("Open Calorie Camera") {
                isCameraPresented = true
            }
            .buttonStyle(.borderedProminent)
            .disabled(isSaving)
        }
        .padding()
        .fullScreenCover(isPresented: $isCameraPresented) {
            CalorieCameraView(
                config: .development,  // Use development config with routerEnabled: true
                onResult: { result in
                    lastResult = result
                    isCameraPresented = false
                    saveFoodLog(result: result)
                },
                onCancel: {
                    isCameraPresented = false
                }
            )
        }
    }
    
    private func saveFoodLog(result: CalorieResult) {
        isSaving = true
        saveError = nil
        saveSuccess = false
        
        Task {
            do {
                try await FoodLogService.shared.saveFoodLog(from: result)
                await MainActor.run {
                    saveSuccess = true
                    isSaving = false
                    // Clear success message after 3 seconds
                    Task {
                        try? await Task.sleep(nanoseconds: 3_000_000_000)
                        await MainActor.run {
                            saveSuccess = false
                        }
                    }
                }
            } catch {
                await MainActor.run {
                    saveError = error.localizedDescription
                    isSaving = false
                    print("❌ [CameraHost] Failed to save food log: \(error)")
                }
            }
        }
    }
}

