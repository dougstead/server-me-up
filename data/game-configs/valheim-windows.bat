@echo off
set SteamAppId=892970
valheim_server.exe -nographics -batchmode -name "{{name}}" -port {{port}} -world "{{world}}" -password "{{password}}" -crossplay
pause
