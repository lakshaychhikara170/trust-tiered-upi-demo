@echo off
echo Starting Android Emulator on your desktop...
start "" "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd medium_phone
timeout /t 10 /nobreak >nul
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" shell monkey -p com.trustpay.app -c android.intent.category.LAUNCHER 1
