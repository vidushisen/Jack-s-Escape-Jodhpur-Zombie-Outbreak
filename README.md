🧟‍♂️ Jack's Escape: Jodhpur Zombie Outbreak
An action-packed 2D top-down survival game built with modern HTML5 Canvas, Vanilla JavaScript, and Glassmorphic CSS3. Help Jack escape the zombie-infested streets of Jodhpur (The Blue City, Rajasthan) and reach safety at Mehrangarh Fort!

GitHub repo sizeGitHub starsLicense

📜 Storyline & Concept
Jack was driving his red Overland SUV down the Rajasthan highway towards Jodhpur when his engine overheated and caught fire. Stranded at the city border, Jack soon discovers the city has been overrun by a terrifying Zombie Outbreak! With a flashlight cone, crowbar, and found firearms, Jack must battle through 8 escalating waves of zombies across a 5000m cobblestone street to reach safety inside Mehrangarh Fort Gate.

✨ Key Features
🌆 Jodhpur Blue City Setting: Continuous 100% infinite cobblestone street grid with traditional blue-sandstone architecture background.
🧟 8 Escalating Survival Waves:
Wave 1 starts with 5 zombies, adding +5 zombies per wave up to 8 max waves.
3 Zombie Types: Walkers (Cyan), Runners (Fast Red), and Tanks (Brute Green).
🔫 4 Armament Weapons:
[1] Crowbar: Infinite melee weapon with knockback.
[2] Pistol: High precision handgun.
[3] Shotgun: Wide multi-pellet spread.
[4] AK-47: Automatic high-damage assault rifle.
💊 Supplies & Health Crates: Collect Medkits (+50 HP) and Ammo crates dropped on streets.
🟢 Dynamic Color HUD & Boards:
Health Bar: Dynamic Color (Green >60%, Orange 30-60%, Red <30%).
Stamina Bar: Dynamic Color (Green >60%, Orange 30-60%, Red <30%).
Destination Board: Tracks 0 / 5000m journey to Fort Entrance Gate.
Zombie Kills Board: Instant counter reset on death restart.
🏰 Epic Physical Fort Gate Ending: Physical Mehrangarh Fort Entrance Gate appears at 5000m. Walking inside triggers victory screen!
🕹️ Controls Guide
Action	Control Key / Mouse
Move Jack	W A S D or Arrow Keys
Sprint	Hold SHIFT
Flashlight / Aim	Move Mouse Cursor
Attack / Shoot	Left Mouse Click / Touch Fire
Exit SUV Car	Press E, Space, or Enter
Select Weapons	1 Crowbar, 2 Pistol, 3 Shotgun, 4 AK-47
📁 Recommended GitHub Repository File Structure
To host your game on GitHub Pages, place all files directly at the root of your repository:


Jack-s-Escape-Jodhpur-Zombie-Outbreak/
├── index.html        # Main HTML layout & HUD containers
├── style.css         # Glassmorphic UI & dynamic bar styling
├── README.md         # Documentation summary
└── js/
    ├── audio.js      # Web Audio API sound effects & BGM
    ├── engine.js     # Canvas renderer & cobblestone street grid
    ├── entities.js   # Player, Car, Zombie, Bullet & Pickup classes
    └── game.js       # Main state machine & game loop
⚠️ Important Note for Uploading: If your files are nested inside a subfolder named jodhpur_zombie_survival/, move index.html, style.css, and the js/ folder directly to the root of the repository so GitHub Pages can load the game immediately!

🚀 How to Run Locally
Clone the Repository:
bash

git clone https://github.com/vidushisen/Jack-s-Escape-Jodhpur-Zombie-Outbreak.git
Open index.html: Double click index.html in any modern web browser (Chrome, Edge, Firefox, Safari) OR serve with Python:
bash

python -m http.server 8080
Visit http://localhost:8080 and enjoy the game!
📄 License
This project is open-source under the MIT License.
