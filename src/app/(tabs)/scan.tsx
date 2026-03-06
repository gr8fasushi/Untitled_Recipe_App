import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as SecureStore from 'expo-secure-store';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';
import { useScan } from '@/features/scan/hooks/useScan';
import { ScanResultCard } from '@/features/scan/components/ScanResultCard';
import { ManualIngredientSearch } from '@/features/scan/components/ManualIngredientSearch';
import { Button, CollapsibleSection } from '@/shared/components/ui';

const MAX_CAPTURES = 5;
const INITIAL_DELAY_MS = 1500;
const INTERVAL_MS = 3500;
const SCAN_INTRO_KEY = 'scan_intro_seen';

export default function ScanScreen(): React.JSX.Element {
  const {
    status,
    error,
    accumulatedIngredients,
    isAnalyzing,
    runScan,
    addManually,
    removeIngredient,
    addAllToPantry,
    clearAll,
  } = useScan();

  const count = accumulatedIngredients.length;
  const isDark = useIsDarkMode();
  const isWeb = Platform.OS === 'web';

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // One-time intro modal
  const [showIntroModal, setShowIntroModal] = useState(false);
  useEffect(() => {
    SecureStore.getItemAsync(SCAN_INTRO_KEY).then((val) => {
      if (!val) setShowIntroModal(true);
    });
  }, []);

  const dismissIntroModal = useCallback(async (): Promise<void> => {
    await SecureStore.setItemAsync(SCAN_INTRO_KEY, 'true');
    setShowIntroModal(false);
  }, []);

  // Auto-capture state
  const [isScanning, setIsScanning] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);

  const cameraRef = useRef<React.ElementRef<typeof CameraView>>(null);
  const isAnalyzingRef = useRef(false);
  const captureCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Keep refs in sync — interval callback reads refs, not stale state
  useEffect(() => {
    isAnalyzingRef.current = isAnalyzing;
  }, [isAnalyzing]);

  useEffect(() => {
    captureCountRef.current = captureCount;
  }, [captureCount]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      if (firstTimerRef.current !== null) clearTimeout(firstTimerRef.current);
    };
  }, []);

  const stopScanning = useCallback((): void => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (firstTimerRef.current !== null) {
      clearTimeout(firstTimerRef.current);
      firstTimerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const doCapture = useCallback(async (): Promise<void> => {
    if (isAnalyzingRef.current) return;
    if (captureCountRef.current >= MAX_CAPTURES) {
      stopScanning();
      return;
    }
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
        exif: false,
      });
      const base64 = photo?.base64;
      if (!base64) return;
      if (isMountedRef.current) {
        setCaptureCount((c) => {
          captureCountRef.current = c + 1;
          return c + 1;
        });
      }
      await runScan(base64, 'image/jpeg');
    } catch {
      // Swallow individual frame errors — scanning continues
    }
  }, [runScan, stopScanning]);

  const startScanning = useCallback((): void => {
    clearAll();
    setCaptureCount(0);
    captureCountRef.current = 0;
    setIsScanning(true);
    firstTimerRef.current = setTimeout(() => {
      void doCapture();
      intervalRef.current = setInterval(() => {
        void doCapture();
      }, INTERVAL_MS);
    }, INITIAL_DELAY_MS);
  }, [clearAll, doCapture]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="scan-screen">
      {/* One-time intro modal */}
      <Modal visible={showIntroModal} transparent animationType="slide">
        <View testID="scan-intro-modal" className="flex-1 justify-end bg-black/60">
          <View className="mx-4 mb-8 rounded-2xl bg-white dark:bg-gray-900 p-6">
            <Text className="text-xl font-nunito-extrabold text-gray-900 dark:text-white mb-3">
              📷 How Scanning Works
            </Text>
            <Text className="text-sm font-nunito text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
              Point your camera at your ingredients. Chef Jules will automatically detect them and
              add them to your kitchen — no tapping needed.
            </Text>
            <View className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-5">
              <Text className="text-base font-nunito-bold text-gray-900 dark:text-white mb-2">
                🔒 Your Privacy
              </Text>
              <Text className="text-sm font-nunito text-gray-700 dark:text-gray-300 leading-relaxed">
                Each frame is analyzed by AI and immediately discarded. No photos or videos are ever
                saved, stored, or shared — with anyone.
              </Text>
            </View>
            <Button
              label="Got it!"
              onPress={() => {
                void dismissIntroModal();
              }}
              testID="btn-intro-dismiss"
            />
          </View>
        </View>
      </Modal>

      {/* Gradient header — teal/cyan photo scan theme */}
      <LinearGradient
        colors={isDark ? ['#042f2e', '#134e4a', '#0f766e'] : ['#134e4a', '#0f766e', '#14b8a6']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.28,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <View className="items-center w-full">
          <View className={`w-full max-w-2xl px-6 pt-3 ${isWeb ? 'pb-8' : 'pb-6'}`}>
            <Text className={`${isWeb ? 'text-5xl' : 'text-4xl'} mb-1`}>📷</Text>
            <Text
              className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight`}
            >
              Scan Ingredients
            </Text>
            <Text
              className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
              style={{ color: '#99f6e4' }}
            >
              Point at your ingredients to auto-detect them
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="w-full max-w-2xl self-center px-4 pt-4">
          {/* How it works info card — always visible, collapsed by default */}
          <CollapsibleSection title="How it works" testID="scan-info-card" defaultExpanded={false}>
            <View className="px-1 pb-2 gap-2">
              <Text className="text-sm font-nunito text-gray-700 dark:text-gray-300">
                Point your camera at your ingredients. Chef Jules auto-detects them in seconds — no
                tapping needed.
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-sm">🔒</Text>
                <Text className="text-sm font-nunito-semibold text-gray-700 dark:text-gray-300 flex-1">
                  No photos or videos are ever saved, stored, or shared.
                </Text>
              </View>
            </View>
          </CollapsibleSection>

          {/* Web fallback */}
          {isWeb ? (
            <View className="rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-6 items-center mb-4">
              <Text className="text-2xl mb-2">📷</Text>
              <Text className="text-sm font-nunito-bold text-gray-700 dark:text-gray-300 text-center">
                Camera scanning is not available on web.
              </Text>
              <Text className="text-sm font-nunito text-gray-500 dark:text-gray-400 text-center mt-1">
                Use manual ingredient search below.
              </Text>
            </View>
          ) : permission === null ? (
            /* Permission state loading */
            <View testID="scan-permission-loading" className="items-center py-8" />
          ) : !permission.granted ? (
            /* Permission not granted */
            <View className="rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-6 items-center mb-4">
              <Text className="text-3xl mb-2">📵</Text>
              <Text className="text-base font-nunito-bold text-gray-800 dark:text-gray-200 text-center mb-1">
                Camera Access Required
              </Text>
              <Text className="text-sm font-nunito text-gray-500 dark:text-gray-400 text-center mb-4">
                To scan ingredients automatically, RecipeApp needs access to your camera.
              </Text>
              <Button
                label="Allow Camera Access"
                onPress={() => {
                  void requestPermission();
                }}
                testID="btn-request-permission"
              />
              {permission.status === 'denied' ? (
                <View className="mt-3 items-center">
                  <Text className="text-xs font-nunito text-gray-400 text-center mb-2">
                    If you denied access, enable it in Settings › Privacy › Camera.
                  </Text>
                  <Button
                    label="Open Settings"
                    onPress={() => {
                      void Linking.openSettings();
                    }}
                    variant="ghost"
                    testID="btn-open-settings"
                  />
                </View>
              ) : null}
            </View>
          ) : (
            /* Camera viewfinder */
            <>
              <CameraView
                ref={cameraRef}
                facing="back"
                testID="camera-viewfinder"
                className="h-64 rounded-2xl overflow-hidden mb-3"
              />

              {/* Scan status text */}
              {isScanning || captureCount > 0 ? (
                <Text
                  testID="scan-status-text"
                  className="text-xs font-nunito-semibold text-center text-teal-700 dark:text-teal-400 mb-3"
                >
                  {isScanning
                    ? `Scanning\u2026 (${captureCount}/${MAX_CAPTURES})`
                    : 'Scan complete'}
                </Text>
              ) : null}

              {/* Scan control buttons */}
              <View className="mb-4">
                {captureCount === 0 && !isScanning ? (
                  <Button label="Start Scanning" onPress={startScanning} testID="btn-start-scan" />
                ) : isScanning ? (
                  <Button
                    label="Stop Scanning"
                    onPress={stopScanning}
                    variant="danger"
                    testID="btn-stop-scan"
                  />
                ) : (
                  <Button
                    label="Scan Again"
                    onPress={startScanning}
                    variant="secondary"
                    testID="btn-scan-again"
                  />
                )}
              </View>
            </>
          )}

          {/* Analyzing indicator */}
          {isAnalyzing ? (
            <View testID="scan-analyzing-indicator" className="flex-row items-center gap-2 pb-3">
              <ActivityIndicator size="small" color="#0f766e" />
              <Text className="text-sm font-nunito text-gray-500 dark:text-gray-400">
                Analyzing frame…
              </Text>
            </View>
          ) : null}

          {/* Error banner */}
          {status === 'error' && error ? (
            <View
              testID="scan-error-banner"
              className="mb-4 rounded-xl bg-red-50 dark:bg-red-950 px-4 py-3"
            >
              <Text className="text-sm font-nunito text-red-700 dark:text-red-300">{error}</Text>
            </View>
          ) : null}

          {/* Manual search */}
          <View className="pb-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Or add manually
            </Text>
            <ManualIngredientSearch onAdd={addManually} alreadyAdded={accumulatedIngredients} />
          </View>

          {/* Accumulated ingredients list */}
          {count > 0 ? (
            <View className="pb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Detected ({count})
                </Text>
                <Pressable onPress={clearAll} testID="btn-clear-all">
                  <Text className="text-sm text-red-500">Clear</Text>
                </Pressable>
              </View>

              <View testID="scan-results-list">
                {accumulatedIngredients.map((ingredient) => (
                  <ScanResultCard
                    key={ingredient.id}
                    ingredient={ingredient}
                    onRemove={() => removeIngredient(ingredient.id)}
                  />
                ))}
              </View>

              <View className="mt-4">
                <Button
                  label={`Add ${count} to My Kitchen`}
                  onPress={addAllToPantry}
                  testID="btn-add-all"
                />
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
