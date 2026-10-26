param([Parameter(Mandatory=$true)][string]$Manifest)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$taskSynth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$taskEnglishVoice = $taskSynth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Name -eq 'Microsoft Zira Desktop' } | Select-Object -First 1
if (-not $taskEnglishVoice) { throw 'The verified English concept-prompt voice is unavailable.' }
$taskSynth.SelectVoice($taskEnglishVoice.VoiceInfo.Name)
$taskSynth.Rate = 0
$taskSynth.Volume = 100
$taskFormat = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(24000,[System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,[System.Speech.AudioFormat.AudioChannel]::Mono)
$taskEntries = Get-Content -LiteralPath $Manifest -Raw -Encoding UTF8 | ConvertFrom-Json
$taskCount = 0
foreach ($taskEntry in $taskEntries) {
  if (-not (Test-Path -LiteralPath $taskEntry.path)) {
    $taskSynth.SetOutputToWaveFile($taskEntry.path,$taskFormat)
    if ($taskEntry.phoneme) {
      $taskText = [System.Security.SecurityElement]::Escape($taskEntry.text)
      $taskPhoneme = [System.Security.SecurityElement]::Escape($taskEntry.phoneme)
      $taskSynth.SpeakSsml("<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><phoneme alphabet='ipa' ph='$taskPhoneme'>$taskText</phoneme></speak>")
    } else {
      $taskSynth.Speak([string]$taskEntry.text)
    }
    $taskSynth.SetOutputToNull()
    $taskCount++
  }
}
$taskSynth.Dispose()
Write-Output "Generated $taskCount original concept-prompt WAV files with Microsoft Zira Desktop."
