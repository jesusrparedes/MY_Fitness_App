document.addEventListener('DOMContentLoaded', async () => {
    
    // Theme Toggle Logic (Kept in local browser storage since it is device specific)
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
        
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }

    // --- NEW: Cloud Data Initialization ---
    let appState;
    try {
        const response = await fetch('/api/state');
        appState = await response.json();
    } catch (error) {
        console.error("Could not connect to database. Check your server.", error);
        return; // Stop the script if the database is unreachable
    }

    // Helper function to save changes back to MongoDB
    async function saveStateToCloud() {
        try {
            await fetch('/api/state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userProfile: appState.userProfile,
                    customCalGoal: appState.customCalGoal,
                    customProGoal: appState.customProGoal,
                    nutritionData: appState.nutritionData,
                    weeklyPlans: appState.weeklyPlans,
                    weeklyLogs: appState.weeklyLogs
                })
            });
        } catch (error) {
            console.error("Error saving to cloud:", error);
        }
    }

    const exerciseDB = {
        chest: {
            john_wooden: [
                { name: "Machine Chest Press", volume: "3x8-10", primary: "Pectoralis Major", secondary: "Triceps, Anterior Deltoids", targets: ["mid_chest"] }, 
                { name: "Pectoral Fly Machine", volume: "3x10-12", primary: "Pectoralis Major", secondary: "Anterior Deltoids", targets: ["mid_chest", "inner_chest"] }, 
                { name: "Cable Crossovers", volume: "4x12-15", primary: "Pectoralis Major (Lower)", secondary: "Anterior Deltoids", targets: ["lower_chest"] }, 
                { name: "Assisted Dip Machine", volume: "3x8-10", primary: "Pectoralis Major (Lower)", secondary: "Triceps", targets: ["lower_chest"] },
                { name: "Barbell Bench Press", volume: "4x6-8", primary: "Pectoralis Major", secondary: "Triceps", targets: ["mid_chest"] },
                { name: "Incline Dumbbell Press", volume: "3x8-10", primary: "Pectoralis Major (Upper)", secondary: "Triceps", targets: ["upper_chest"] }
            ],
            home: [
                { name: "Dumbbell Bench Press", volume: "4x8-10", primary: "Pectoralis Major", secondary: "Triceps, Anterior Deltoids", targets: ["mid_chest"] }, 
                { name: "Dumbbell Flyes", volume: "3x10-12", primary: "Pectoralis Major", secondary: "Anterior Deltoids", targets: ["mid_chest"] }, 
                { name: "Push-ups", volume: "3x to failure", primary: "Pectoralis Major", secondary: "Triceps, Core", targets: ["mid_chest"] }, 
                { name: "Dumbbell Incline Press", volume: "3x10-12", primary: "Pectoralis Major (Upper)", secondary: "Triceps", targets: ["upper_chest"] }
            ],
            bodyweight: [
                { name: "Standard Push-ups", volume: "4x10-15", primary: "Pectoralis Major", secondary: "Triceps, Core", targets: ["mid_chest"] },
                { name: "Wide Grip Push-ups", volume: "3x10-15", primary: "Pectoralis Major", secondary: "Anterior Deltoids", targets: ["mid_chest", "outer_chest"] },
                { name: "Decline Push-ups (Feet Elevated)", volume: "3x8-12", primary: "Pectoralis Major (Upper)", secondary: "Triceps", targets: ["upper_chest"] },
                { name: "Chair/Bench Dips", volume: "3x10-15", primary: "Pectoralis Major (Lower)", secondary: "Triceps", targets: ["lower_chest"] }
            ]
        },
        back: {
            john_wooden: [
                { name: "Pulldown Machine", volume: "3x8-10", primary: "Latissimus Dorsi", secondary: "Biceps, Rear Deltoids", targets: ["lats"] }, 
                { name: "Row Machine", volume: "3x10-12", primary: "Rhomboids, Mid-Traps", secondary: "Lats, Biceps", targets: ["mid_back", "lats"] }, 
                { name: "Eclipse Row Machine", volume: "3x10-12", primary: "Mid-Back", secondary: "Lats", targets: ["mid_back", "lats"] },
                { name: "Rope Trainer", volume: "3x60 secs", primary: "Latissimus Dorsi", secondary: "Arms, Core", targets: ["lats", "mid_back"] },
                { name: "Assisted Chin-up Machine", volume: "3x8-10", primary: "Latissimus Dorsi", secondary: "Biceps", targets: ["lats"] },
                { name: "Rear Delt Machine", volume: "3x12-15", primary: "Posterior Deltoids", secondary: "Rhomboids", targets: ["mid_back"] },
                { name: "Kettlebell Rows", volume: "4x8-10", primary: "Lats, Mid-Back", secondary: "Biceps", targets: ["lats", "mid_back"] }
            ],
            home: [
                { name: "Dumbbell Single-Arm Row", volume: "4x8-10", primary: "Latissimus Dorsi", secondary: "Biceps, Rhomboids", targets: ["lats", "mid_back"] }, 
                { name: "Dumbbell Pullover", volume: "3x10-12", primary: "Latissimus Dorsi", secondary: "Pectorals, Triceps", targets: ["lats"] }, 
                { name: "Dumbbell Shrugs", volume: "4x12-15", primary: "Upper Trapezius", secondary: "Levator Scapulae", targets: ["traps"] }
            ],
            bodyweight: [
                { name: "Prone Snow Angels", volume: "3x15", primary: "Rhomboids, Traps", secondary: "Lower Back", targets: ["mid_back", "traps"] },
                { name: "Superman Holds", volume: "3x30 secs", primary: "Lower Back", secondary: "Glutes", targets: ["lats", "mid_back"] },
                { name: "Doorway Rows (Using Frame)", volume: "3x10", primary: "Latissimus Dorsi", secondary: "Biceps", targets: ["lats", "mid_back"] },
                { name: "Floor Sliding Pulldowns", volume: "3x10", primary: "Latissimus Dorsi", secondary: "Core", targets: ["lats"] }
            ]
        },
        legs: {
            john_wooden: [
                { name: "Leg Press", volume: "4x8-10", primary: "Quadriceps", secondary: "Glutes, Hamstrings", targets: ["quads", "glutes"] }, 
                { name: "Seated Leg Extension", volume: "3x12-15", primary: "Quadriceps", secondary: "None", targets: ["quads"] }, 
                { name: "Leg Curl", volume: "3x12-15", primary: "Hamstrings", secondary: "Calves", targets: ["hamstrings"] }, 
                { name: "Standing Calves Raise", volume: "4x15-20", primary: "Gastrocnemius, Soleus", secondary: "None", targets: ["calves"] },
                { name: "Hip Adduction Machine", volume: "3x15", primary: "Adductors", secondary: "Glutes", targets: ["glutes"] },
                { name: "Glute Bridge Machine", volume: "3x10-12", primary: "Glutes", secondary: "Hamstrings", targets: ["glutes"] },
                { name: "Vertical Smith Machine Squats", volume: "4x8-10", primary: "Quadriceps", secondary: "Glutes, Hamstrings", targets: ["quads", "glutes"] }
            ],
            home: [
                { name: "Dumbbell Goblet Squat", volume: "4x8-10", primary: "Quadriceps", secondary: "Glutes, Core", targets: ["quads", "glutes"] }, 
                { name: "Dumbbell Lunges", volume: "3x10-12 per leg", primary: "Quadriceps, Glutes", secondary: "Hamstrings", targets: ["quads", "glutes"] }, 
                { name: "Dumbbell Romanian Deadlift", volume: "4x8-10", primary: "Hamstrings", secondary: "Glutes, Lower Back", targets: ["hamstrings"] }, 
                { name: "Calf Raises", volume: "4x15-20", primary: "Gastrocnemius, Soleus", secondary: "None", targets: ["calves"] }
            ],
            bodyweight: [
                { name: "Bodyweight Squats", volume: "4x15-20", primary: "Quadriceps", secondary: "Glutes", targets: ["quads", "glutes"] },
                { name: "Walking Lunges", volume: "3x12 per leg", primary: "Quadriceps, Glutes", secondary: "Hamstrings", targets: ["quads", "glutes"] },
                { name: "Single-Leg Glute Bridges", volume: "3x12 per leg", primary: "Glutes", secondary: "Hamstrings", targets: ["glutes", "hamstrings"] },
                { name: "Bodyweight Calf Raises", volume: "4x25", primary: "Gastrocnemius, Soleus", secondary: "None", targets: ["calves"] }
            ]
        },
        arms: {
            john_wooden: [
                { name: "Tricep Extension Machine", volume: "3x10-12", primary: "Triceps Brachii", secondary: "None", targets: ["triceps"] }, 
                { name: "Bicep Curl Machine", volume: "3x10-12", primary: "Biceps Brachii", secondary: "Brachialis", targets: ["biceps"] }, 
                { name: "EZ Bar Preacher Curls", volume: "3x10-12", primary: "Biceps Brachii", secondary: "Brachialis", targets: ["biceps"] },
                { name: "Cable Tricep Pushdowns", volume: "3x12-15", primary: "Triceps Brachii", secondary: "None", targets: ["triceps"] },
                { name: "Dumbbell Hammer Curls", volume: "3x10-12", primary: "Brachioradialis", secondary: "Biceps", targets: ["biceps", "forearms"] },
                { name: "Medicine Ball Slams", volume: "3x15", primary: "Core", secondary: "Arms, Shoulders", targets: ["triceps", "forearms"] }
            ],
            home: [
                { name: "Dumbbell Bicep Curl", volume: "4x10-12", primary: "Biceps Brachii", secondary: "Brachialis", targets: ["biceps"] }, 
                { name: "Dumbbell Overhead Extension", volume: "3x10-12", primary: "Triceps Brachii", secondary: "None", targets: ["triceps"] }, 
                { name: "Dumbbell Hammer Curls", volume: "3x10-12", primary: "Brachioradialis", secondary: "Biceps", targets: ["biceps", "forearms"] }, 
                { name: "Dumbbell Wrist Curls", volume: "3x15", primary: "Forearm Flexors", secondary: "None", targets: ["forearms"] }
            ],
            bodyweight: [
                { name: "Diamond Push-ups", volume: "3x10-12", primary: "Triceps Brachii", secondary: "Chest", targets: ["triceps"] },
                { name: "Chair/Floor Tricep Dips", volume: "3x15", primary: "Triceps Brachii", secondary: "Anterior Deltoids", targets: ["triceps"] },
                { name: "Plank to Push-up", volume: "3x10", primary: "Triceps Brachii", secondary: "Core", targets: ["triceps", "forearms"] },
                { name: "Bodyweight Bicep Curls (Under Table)", volume: "3x10", primary: "Biceps Brachii", secondary: "Back", targets: ["biceps"] }
            ]
        },
        cardio: {
            john_wooden: [
                { name: "Stair Master", volume: "1x20 mins", primary: "Cardiovascular System", secondary: "Calves, Glutes", targets: ["steady_state", "intervals"] },
                { name: "Elliptical Machine", volume: "1x30 mins", primary: "Cardiovascular System", secondary: "Full Body", targets: ["steady_state", "intervals"] },
                { name: "Exercise Bike Machine", volume: "1x30 mins", primary: "Cardiovascular System", secondary: "Legs", targets: ["steady_state", "intervals"] },
                { name: "Rowing Machine", volume: "1x15 mins", primary: "Cardiovascular System", secondary: "Back, Arms, Core", targets: ["steady_state", "intervals"] },
                { name: "Treadmill", volume: "1x30 mins", primary: "Cardiovascular System", secondary: "Legs", targets: ["steady_state", "intervals"] }
            ],
            home: [
                { name: "Outdoor Running", volume: "1x30 mins", primary: "Cardiovascular System", secondary: "Legs", targets: ["steady_state", "intervals"] },
                { name: "Jump Rope", volume: "5x3 mins", primary: "Cardiovascular System", secondary: "Calves", targets: ["intervals"] },
                { name: "Burpees / HIIT", volume: "4x5 mins", primary: "Cardiovascular System", secondary: "Full Body", targets: ["intervals"] },
                { name: "Bicycling", volume: "1x45 mins", primary: "Cardiovascular System", secondary: "Legs", targets: ["steady_state"] }
            ],
            bodyweight: [
                { name: "Burpees", volume: "4x60 secs", primary: "Cardiovascular System", secondary: "Full Body", targets: ["intervals"] },
                { name: "Jumping Jacks", volume: "5x60 secs", primary: "Cardiovascular System", secondary: "Calves", targets: ["intervals"] },
                { name: "High Knees", volume: "4x45 secs", primary: "Cardiovascular System", secondary: "Core, Legs", targets: ["intervals"] },
                { name: "Mountain Climbers", volume: "4x60 secs", primary: "Cardiovascular System", secondary: "Core, Shoulders", targets: ["intervals", "steady_state"] }
            ]
        }
    };


    // ==========================================
    // PAGE 1: Dashboard
    // ==========================================
    const profileForm = document.getElementById('profileForm');
    const autoGenCheck = document.getElementById('autoGenerateWorkout');
    const prefDaysContainer = document.getElementById('prefDaysContainer');

    if (autoGenCheck && prefDaysContainer) {
        autoGenCheck.addEventListener('change', (e) => {
            prefDaysContainer.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    if (profileForm) {
        if (appState.userProfile) {
            document.getElementById('height').value = appState.userProfile.height || 68;
            document.getElementById('weight').value = appState.userProfile.weight || 190;
            if(appState.userProfile.goalWeight) document.getElementById('goalWeight').value = appState.userProfile.goalWeight;
            if(appState.userProfile.targetDate) document.getElementById('targetDate').value = appState.userProfile.targetDate;
            calculateMacros(appState.userProfile);
        }

        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const profileData = {
                height: document.getElementById('height').value,
                weight: document.getElementById('weight').value,
                goalWeight: document.getElementById('goalWeight').value,
                targetDate: document.getElementById('targetDate').value
            };
            
            let generateWorkout = document.getElementById('autoGenerateWorkout').checked;
            let prefDays = Array.from(document.querySelectorAll('input[name="prefDays"]:checked')).map(cb => cb.value);

            if (generateWorkout && profileData.goalWeight && profileData.targetDate) {
                const currentWeight = parseFloat(profileData.weight);
                const goalWeight = parseFloat(profileData.goalWeight);
                const weightToLose = currentWeight - goalWeight;
                
                const targetDate = new Date(profileData.targetDate);
                const today = new Date();
                const diffTime = targetDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays <= 0) {
                    alert("Target date must be in the future.");
                    return; 
                }

                let minDaysNeeded = 0;

                if (weightToLose > 0) {
                    const totalCalsToBurn = weightToLose * 3500;
                    const maxDietDeficitPerDay = 1000;
                    const totalDietDeficit = maxDietDeficitPerDay * diffDays;
                    const remainingCalsForExercise = totalCalsToBurn - totalDietDeficit;

                    if (remainingCalsForExercise > 0) {
                        const weeks = diffDays / 7;
                        const estBurnPerWorkout = currentWeight * 2.4; 
                        const totalWorkoutsNeeded = remainingCalsForExercise / estBurnPerWorkout;
                        minDaysNeeded = Math.ceil(totalWorkoutsNeeded / weeks);
                    }
                }

                if (minDaysNeeded > 7) {
                    alert(`🚨 mathematically impossible in ${diffDays} days. Please extend your target date.`);
                    return; 
                }

                if (prefDays.length < minDaysNeeded) {
                    if (minDaysNeeded >= 5) {
                        alert(`🚨 Reality Check: Diet alone will not work. We are overriding your preferences to a mandatory 5-day training split to hit this goal safely.`);
                        prefDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                        document.querySelectorAll('input[name="prefDays"]').forEach(cb => {
                            cb.checked = prefDays.includes(cb.value);
                        });
                    } else {
                        alert(`🚨 Reality Check: You MUST work out a minimum of ${minDaysNeeded} days per week. Please select more days.`);
                        return; 
                    }
                }

                if (prefDays.length === 0) {
                    prefDays = ['Monday', 'Wednesday', 'Friday'];
                }

                buildDynamicPlan(prefDays);
                alert(`Profile updated! A custom ${prefDays.length}-day workout routine has been saved.`);
            } else if (!generateWorkout) {
                alert("Profile and goals updated!");
            }

            appState.userProfile = profileData;
            calculateMacros(profileData);
            saveStateToCloud();
        });

        function buildDynamicPlan(daysArray) {
            if (!appState.weeklyPlans) appState.weeklyPlans = {};
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            daysOfWeek.forEach(d => { delete appState.weeklyPlans[d]; });

            const splits = [];

            switch(daysArray.length) {
                case 1:
                    splits.push({ muscle: "Full Body Burn", exercises: [...exerciseDB.chest.john_wooden.slice(0,1), ...exerciseDB.back.john_wooden.slice(0,1), ...exerciseDB.legs.john_wooden.slice(0,1), ...exerciseDB.cardio.john_wooden.slice(0,1)] });
                    break;
                case 2:
                    splits.push({ muscle: "Upper Body & Cardio", exercises: [...exerciseDB.chest.john_wooden.slice(0,2), ...exerciseDB.back.john_wooden.slice(0,2), ...exerciseDB.cardio.john_wooden.slice(0,1)] });
                    splits.push({ muscle: "Lower Body & Core", exercises: [...exerciseDB.legs.john_wooden.slice(0,3), ...exerciseDB.arms.john_wooden.slice(0,1)] });
                    break;
                case 3:
                    splits.push({ muscle: "Push (Chest/Tri)", exercises: [...exerciseDB.chest.john_wooden.slice(0,3), ...exerciseDB.arms.john_wooden.slice(0,1)] });
                    splits.push({ muscle: "Pull (Back/Bi)", exercises: [...exerciseDB.back.john_wooden.slice(0,3), ...exerciseDB.arms.john_wooden.slice(1,2)] });
                    splits.push({ muscle: "Legs & Cardio", exercises: [...exerciseDB.legs.john_wooden.slice(0,3), ...exerciseDB.cardio.john_wooden.slice(0,1)] });
                    break;
                case 4:
                    splits.push({ muscle: "Upper Power", exercises: [...exerciseDB.chest.john_wooden.slice(0,2), ...exerciseDB.back.john_wooden.slice(0,2)] });
                    splits.push({ muscle: "Lower Power", exercises: [...exerciseDB.legs.john_wooden.slice(0,3)] });
                    splits.push({ muscle: "Hypertrophy Arms", exercises: [...exerciseDB.arms.john_wooden] });
                    splits.push({ muscle: "Cardio Burn", exercises: [...exerciseDB.cardio.john_wooden.slice(0,2)] });
                    break;
                case 5:
                    splits.push({ muscle: "Chest Focus", exercises: [...exerciseDB.chest.john_wooden] });
                    splits.push({ muscle: "Back Focus", exercises: [...exerciseDB.back.john_wooden] });
                    splits.push({ muscle: "Legs Focus", exercises: [...exerciseDB.legs.john_wooden] });
                    splits.push({ muscle: "Arms Focus", exercises: [...exerciseDB.arms.john_wooden] });
                    splits.push({ muscle: "HIIT Cardio", exercises: [...exerciseDB.cardio.home.slice(1,3)] }); 
                    break;
                case 6:
                    splits.push({ muscle: "Push (Chest/Tri)", exercises: [...exerciseDB.chest.john_wooden.slice(0,3), ...exerciseDB.arms.john_wooden.slice(0,1)] });
                    splits.push({ muscle: "Pull (Back/Bi)", exercises: [...exerciseDB.back.john_wooden.slice(0,3), ...exerciseDB.arms.john_wooden.slice(1,2)] });
                    splits.push({ muscle: "Legs", exercises: [...exerciseDB.legs.john_wooden.slice(0,3)] });
                    splits.push({ muscle: "Push Power", exercises: [...exerciseDB.chest.john_wooden.slice(0,2), ...exerciseDB.cardio.john_wooden.slice(0,1)] });
                    splits.push({ muscle: "Pull Power", exercises: [...exerciseDB.back.john_wooden.slice(0,2), ...exerciseDB.arms.john_wooden.slice(0,2)] });
                    splits.push({ muscle: "Cardio Burn", exercises: [...exerciseDB.cardio.john_wooden.slice(0,2)] });
                    break;
                case 7:
                    splits.push({ muscle: "Push Focus", exercises: [...exerciseDB.chest.john_wooden.slice(0,3), ...exerciseDB.arms.john_wooden.slice(0,1)] });
                    splits.push({ muscle: "Pull Focus", exercises: [...exerciseDB.back.john_wooden.slice(0,3), ...exerciseDB.arms.john_wooden.slice(1,2)] });
                    splits.push({ muscle: "Legs Focus", exercises: [...exerciseDB.legs.john_wooden.slice(0,3)] });
                    splits.push({ muscle: "Active Recovery", exercises: [...exerciseDB.cardio.john_wooden.slice(0,1)] });
                    splits.push({ muscle: "Upper Hypertrophy", exercises: [...exerciseDB.chest.john_wooden.slice(0,2), ...exerciseDB.back.john_wooden.slice(0,2)] });
                    splits.push({ muscle: "Lower Hypertrophy", exercises: [...exerciseDB.legs.john_wooden.slice(0,2), ...exerciseDB.cardio.john_wooden.slice(1,2)] });
                    splits.push({ muscle: "Arms & Core", exercises: [...exerciseDB.arms.john_wooden] });
                    break;
            }

            daysArray.forEach((day, index) => {
                appState.weeklyPlans[day] = {
                    muscle: splits[index].muscle,
                    location: "UCLA Gym",
                    exercises: splits[index].exercises
                };
            });
            
            appState.weeklyLogs = {};
        }

        function calculateMacros(data) {
            const output = document.getElementById('macroResults');
            if (!data.goalWeight) {
                output.innerHTML = `<p><em>Your current weight is logged. Set a goal weight to generate specific calorie/protein targets.</em></p>`;
                return;
            }
            
            const isLosing = parseInt(data.goalWeight) < parseInt(data.weight);
            const dailyCals = isLosing ? 2000 : 2800; 
            const proteinGoal = Math.round(parseInt(data.goalWeight) * 0.8); 

            appState.customCalGoal = dailyCals;
            appState.customProGoal = proteinGoal;
        
            const todayKey = new Date().toISOString().split('T')[0];
            
            let consumedCals = 0;
            if (appState.nutritionData && appState.nutritionData.date === todayKey && appState.nutritionData.logs) {
                appState.nutritionData.logs.forEach(log => consumedCals += log.cals);
            }

            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const activeDay = daysOfWeek[new Date().getDay()]; 
            const todayLogs = (appState.weeklyLogs && appState.weeklyLogs[activeDay]) ? appState.weeklyLogs[activeDay] : [];
            
            let estMinutes = 0;
            todayLogs.forEach(log => {
                estMinutes += (parseInt(log.sets) * 3);
            });

            const currentWeight = parseFloat(data.weight);
            const heightInches = parseFloat(data.height);
            
            const maintenanceCals = currentWeight * 15; 
            const activeBurnedCals = Math.round(estMinutes * (currentWeight * 0.04)); 
            
            const netCals = consumedCals - (maintenanceCals + activeBurnedCals);
            const estimatedWeightChange = netCals / 3500;
            const liveWeight = (currentWeight + estimatedWeightChange).toFixed(2);

            const bmi = (703 * (liveWeight / (heightInches * heightInches))).toFixed(1);
            let bmiCategory = "";
            let bmiColor = "";
            
            if (bmi < 18.5) {
                bmiCategory = "Underweight";
                bmiColor = "#f39c12"; 
            } else if (bmi >= 18.5 && bmi <= 24.9) {
                bmiCategory = "Normal Weight";
                bmiColor = "#27ae60"; 
            } else if (bmi >= 25 && bmi <= 29.9) {
                bmiCategory = "Overweight";
                bmiColor = "#e67e22"; 
            } else {
                bmiCategory = "Obese";
                bmiColor = "#c0392b"; 
            }

            output.innerHTML = `
                <br>
                <span class="inline-stat">Calorie Goal: ${dailyCals} kcal</span>
                <span class="inline-stat">Protein Goal: ${proteinGoal}g</span>
                <br><br>
                <div style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 4px; border-left: 4px solid var(--secondary-accent);">
                    <strong style="font-size: 1.1rem; color: var(--primary-accent);">⚖️ Live Est. Weight: ${liveWeight} lbs</strong><br>
                    <span style="font-size: 0.85rem; color: #666; margin-top: 5px; display: inline-block;">
                        Maintenance: ~${maintenanceCals} kcal<br>
                        Activity Burn: ~${activeBurnedCals} kcal<br>
                        Consumed: ${consumedCals} kcal
                    </span>
                    
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 12px 0;">
                    
                    <strong style="font-size: 1.05rem; color: var(--primary-accent);">📊 Live Est. BMI: ${bmi}</strong>
                    <span style="font-size: 0.85rem; font-weight: bold; color: white; background: ${bmiColor}; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">${bmiCategory}</span>
                </div>
            `;
        }
    }


    // ==========================================
    // PAGE 2: Nutrition Tracker
    // ==========================================
    const adjustGoalsForm = document.getElementById('adjustGoalsForm');
    if (adjustGoalsForm) {
        
        const todayKey = new Date().toISOString().split('T')[0]; 

        if (!appState.nutritionData || appState.nutritionData.date !== todayKey) {
            appState.nutritionData = { date: todayKey, logs: [] };
            saveStateToCloud();
        }

        let calGoal = appState.customCalGoal;
        let proGoal = appState.customProGoal;
        const waterGoal = 128; 
        
        if (!calGoal || !proGoal) {
            if (appState.userProfile && appState.userProfile.goalWeight) {
                calGoal = parseInt(appState.userProfile.goalWeight) < parseInt(appState.userProfile.weight) ? 2000 : 2800;
                proGoal = Math.round(parseInt(appState.userProfile.goalWeight) * 0.8);
            } else {
                calGoal = 2000;
                proGoal = 150;
            }
        }

        document.getElementById('customCalGoal').value = calGoal;
        document.getElementById('customProGoal').value = proGoal;

        const updateNutritionUI = () => {
            let dailyCalories = 0;
            let dailyProtein = 0;
            let dailyWater = 0;

            if (appState.nutritionData && appState.nutritionData.logs) {
                appState.nutritionData.logs.forEach(log => {
                    dailyCalories += log.cals;
                    dailyProtein += log.protein;
                    dailyWater += log.water;
                });
            }

            const caloriesLeft = calGoal - dailyCalories;

            const calPercent = Math.round((dailyCalories / calGoal) * 100) || 0;
            const proPercent = Math.round((dailyProtein / proGoal) * 100) || 0;
            const waterPercent = Math.round((dailyWater / waterGoal) * 100) || 0;

            document.getElementById('calGoalDisplay').textContent = calGoal;
            document.getElementById('proGoalDisplay').textContent = proGoal;
            
            document.getElementById('caloriesConsumedDisplay').textContent = dailyCalories;
            document.getElementById('caloriesLeftDisplay').textContent = `${caloriesLeft} left`;
            document.getElementById('calPercentText').textContent = `${calPercent}%`;
            
            document.getElementById('proteinTotalDisplay').textContent = dailyProtein;
            document.getElementById('proPercentText').textContent = `${proPercent}%`;

            document.getElementById('waterTotalDisplay').textContent = dailyWater;
            document.getElementById('waterPercentText').textContent = `${waterPercent}%`;

            document.getElementById('calProgressBar').style.width = `${Math.min(calPercent, 100)}%`;
            document.getElementById('proProgressBar').style.width = `${Math.min(proPercent, 100)}%`;
            document.getElementById('waterProgressBar').style.width = `${Math.min(waterPercent, 100)}%`;

            const warning = document.getElementById('calorieWarning');
            if (caloriesLeft <= 0) {
                warning.style.display = 'block';
                document.getElementById('caloriesConsumedDisplay').style.color = 'var(--secondary-accent)';
            } else {
                warning.style.display = 'none';
                document.getElementById('caloriesConsumedDisplay').style.color = 'var(--primary-accent)';
            }

            renderNutritionLogs();
        };

        const renderNutritionLogs = () => {
            const logOutput = document.getElementById('nutritionLogOutput');
            logOutput.innerHTML = '';

            if (!appState.nutritionData || !appState.nutritionData.logs || appState.nutritionData.logs.length === 0) {
                logOutput.innerHTML = `<p class="empty-state">No food or water logged yet today.</p>`;
                return;
            }

            [...appState.nutritionData.logs].reverse().forEach(log => {
                const newLog = document.createElement('li');
                newLog.style.display = 'flex';
                newLog.style.justifyContent = 'space-between';
                newLog.style.alignItems = 'center';
                newLog.style.marginBottom = '10px';
                newLog.style.borderBottom = '1px solid #ccc';
                newLog.style.paddingBottom = '5px';
                
                const details = log.water > 0 ? `${log.water} oz logged` : `${log.cals} kcal | ${log.protein}g protein`;

                newLog.innerHTML = `
                    <div>
                        <strong>${log.name}</strong>
                        <ul>
                            <li>${details}</li>
                        </ul>
                    </div>
                    <button class="delete-btn" style="background: var(--secondary-accent); padding: 5px 10px; font-size: 0.8rem; border-radius: 4px; color: white; border: none; cursor: pointer;">Delete</button>
                `;

                newLog.querySelector('.delete-btn').addEventListener('click', function() {
                    appState.nutritionData.logs = appState.nutritionData.logs.filter(item => item.id !== log.id);
                    saveStateToCloud();
                    updateNutritionUI();
                });

                logOutput.appendChild(newLog);
            });
        };

        updateNutritionUI();

        adjustGoalsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            calGoal = parseInt(document.getElementById('customCalGoal').value);
            proGoal = parseInt(document.getElementById('customProGoal').value);
            
            appState.customCalGoal = calGoal;
            appState.customProGoal = proGoal;
            saveStateToCloud();
            
            updateNutritionUI();
            alert("Nutrition goals saved to cloud!");
        });
        
        const addLogEntry = (name, cals, protein, water) => {
            const logItem = {
                id: Date.now(), 
                name: name,
                cals: cals,
                protein: protein,
                water: water
            };

            if (!appState.nutritionData) appState.nutritionData = { date: todayKey, logs: [] };
            if (!appState.nutritionData.logs) appState.nutritionData.logs = [];

            appState.nutritionData.logs.push(logItem);
            saveStateToCloud();
            updateNutritionUI();
        };

        document.getElementById('foodForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('foodName').value;
            const cals = parseInt(document.getElementById('foodCalories').value) || 0;
            const protein = parseInt(document.getElementById('foodProtein').value) || 0;
            
            addLogEntry(name, cals, protein, 0);
            e.target.reset(); 
        });

        document.getElementById('waterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseInt(document.getElementById('waterAmount').value);
            
            addLogEntry('Water', 0, 0, amount);
            e.target.reset(); 
        });
    }

    // ==========================================
    // PAGE 3: Workouts Tracker & Generator
    // ==========================================
    const weekNavContainer = document.getElementById('weekNavContainer');
    if (weekNavContainer) {
        
        const subMusclesOptions = {
            chest: [
                { id: 'upper_chest', label: 'Upper Chest' },
                { id: 'mid_chest', label: 'Mid/Inner Chest' },
                { id: 'lower_chest', label: 'Lower Chest' }
            ],
            back: [
                { id: 'lats', label: 'Lats' },
                { id: 'mid_back', label: 'Mid-Back' },
                { id: 'traps', label: 'Traps' }
            ],
            legs: [
                { id: 'quads', label: 'Quadriceps' },
                { id: 'hamstrings', label: 'Hamstrings' },
                { id: 'glutes', label: 'Glutes' },
                { id: 'calves', label: 'Calves' }
            ],
            arms: [
                { id: 'biceps', label: 'Biceps' },
                { id: 'triceps', label: 'Triceps' },
                { id: 'forearms', label: 'Forearms' }
            ],
            cardio: [
                { id: 'steady_state', label: 'Steady State (LISS)' },
                { id: 'intervals', label: 'Intervals (HIIT)' }
            ]
        };

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let activeDay = daysOfWeek[new Date().getDay()]; 

        if (!appState.weeklyPlans) appState.weeklyPlans = {};
        if (!appState.weeklyLogs) appState.weeklyLogs = {};

        const displayActiveDay = document.getElementById('displayActiveDay');
        const addActiveDayText = document.getElementById('addActiveDayText');
        const dailyPlanContainer = document.getElementById('dailyPlanContainer');
        const exerciseSelect = document.getElementById('exerciseName');
        const logOutput = document.getElementById('workoutLogOutput');
        
        const generatorForm = document.getElementById('generatorForm');
        const logForm = document.getElementById('logForm');
        const addExerciseForm = document.getElementById('addExerciseForm');
        const subMuscleContainer = document.getElementById('subMuscleContainer');

        const populateSubMuscles = () => {
            const selectedMuscles = Array.from(document.querySelectorAll('input[name="primaryMuscle"]:checked')).map(cb => cb.value);
            let html = '';
            
            if(selectedMuscles.length > 0) {
                html += `<p style="width: 100%; margin: 0 0 5px 0; font-size: 0.9rem; color: #555;">Focus Areas (Leave all blank for full routine):</p>`;
                selectedMuscles.forEach(muscle => {
                    const options = subMusclesOptions[muscle];
                    if (options) {
                        options.forEach(opt => {
                            html += `<label><input type="checkbox" name="subMuscle" value="${opt.id}"> ${opt.label}</label>`;
                        });
                    }
                });
            } else {
                html = `<p style="width: 100%; margin: 0 0 5px 0; font-size: 0.9rem; color: #e74c3c;">Please select at least one primary group above.</p>`;
            }
            subMuscleContainer.innerHTML = html;
        };

        populateSubMuscles();
        document.querySelectorAll('input[name="primaryMuscle"]').forEach(cb => {
            cb.addEventListener('change', populateSubMuscles);
        });

        const renderWeekNav = () => {
            weekNavContainer.innerHTML = '';
            daysOfWeek.forEach(day => {
                const btn = document.createElement('button');
        
                btn.type = 'button'; // This is the only new line you need
        
                btn.classList.add('day-btn');
                if (day === activeDay) btn.classList.add('active');
                btn.textContent = day.substring(0, 3);
        
                btn.addEventListener('click', () => {
                    activeDay = day;
                    renderWeekNav(); 
                    updateWorkoutUI(); 
                });
                weekNavContainer.appendChild(btn);
            });
        };

        const updateWorkoutUI = () => {
            displayActiveDay.textContent = activeDay;
            if(addActiveDayText) addActiveDayText.textContent = activeDay;
            
            exerciseSelect.innerHTML = '';
            dailyPlanContainer.innerHTML = '';

            const todayPlan = appState.weeklyPlans[activeDay];
            const todayLogs = appState.weeklyLogs[activeDay] || [];

            const loggedVolumes = {};
            todayLogs.forEach(log => {
                if (!loggedVolumes[log.exercise]) loggedVolumes[log.exercise] = 0;
                loggedVolumes[log.exercise] += (parseInt(log.sets) * parseInt(log.reps));
            });

            if (todayPlan && todayPlan.exercises && todayPlan.exercises.length > 0) {
                const totalExercises = todayPlan.exercises.length;
                let totalWorkoutProgress = 0;
                let totalEstMinutes = 0; 
                
                const userWeight = (appState.userProfile && appState.userProfile.weight) ? parseFloat(appState.userProfile.weight) : 190;
                
                // PASS 1: Math
                todayPlan.exercises.forEach(ex => {
                    const exName = typeof ex === 'string' ? ex : ex.name;
                    const exVolume = typeof ex === 'string' ? "3x8-12" : ex.volume;

                    const parts = exVolume.toLowerCase().split('x');
                    const targetSets = parseInt(parts[0]) || 1;
                    const targetReps = parseInt(parts[1]) || 10; 
                    const targetTotalVolume = targetSets * targetReps;

                    if (exVolume.toLowerCase().includes('min')) {
                        totalEstMinutes += targetTotalVolume; 
                    } else {
                        totalEstMinutes += (targetSets * 3);
                    }

                    const actualVolume = loggedVolumes[exName] || 0;
                    const overallContribution = Math.min(actualVolume / targetTotalVolume, 1) * (100 / totalExercises);
                    totalWorkoutProgress += overallContribution;
                });

                const totalEstBurn = Math.round(totalEstMinutes * (userWeight * 0.04));

                const progressUI = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px;">
                        <div>
                            <strong style="display: block;">Target: ${todayPlan.muscle.toUpperCase()} (${todayPlan.location})</strong>
                            <span style="font-size: 0.85rem; color: #666;">⏱️ Est. Time: ~${totalEstMinutes} mins | 🔥 Est. Burn: ~${totalEstBurn} kcal</span>
                        </div>
                        <span style="font-size: 0.9rem; font-weight: bold;">${Math.round(totalWorkoutProgress)}% Total</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-fill" style="width: ${totalWorkoutProgress}%;"></div>
                    </div>
                `;

                dailyPlanContainer.innerHTML = progressUI;

                // PASS 2: DOM
                const planList = document.createElement('ul');
                planList.style.listStyle = 'none';
                planList.style.padding = '0';

                todayPlan.exercises.forEach((ex, index) => {
                    const exName = typeof ex === 'string' ? ex : ex.name;
                    const exVolume = typeof ex === 'string' ? "3x8-12" : ex.volume;
                    const exPrimary = typeof ex === 'string' ? "N/A" : (ex.primary || "Target Muscle");
                    const exSecondary = typeof ex === 'string' ? "N/A" : (ex.secondary || "Synergists");

                    const parts = exVolume.toLowerCase().split('x');
                    const targetSets = parseInt(parts[0]) || 1;
                    const targetReps = parseInt(parts[1]) || 10; 
                    const targetTotalVolume = targetSets * targetReps;

                    const actualVolume = loggedVolumes[exName] || 0;
                    const exercisePercentage = Math.round((actualVolume / targetTotalVolume) * 100);
                    const badgeClass = exercisePercentage >= 100 ? 'badge complete' : 'badge';

                    const li = document.createElement('li');
                    li.className = 'exercise-item';
                    li.innerHTML = `
                        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                            <span style="display: flex; align-items: center; gap: 8px;">
                                <span>${exName} <strong style="color: var(--secondary-accent); font-size: 0.9em;">(${exVolume})</strong></span>
                                <button class="remove-ex-btn" title="Remove from plan" style="background: transparent; color: var(--secondary-accent); border: 1px solid var(--secondary-accent); border-radius: 4px; padding: 2px 6px; font-size: 0.7rem; cursor: pointer; transition: all 0.2s;">✖</button>
                            </span>
                            <span class="${badgeClass}">${exercisePercentage}% Done</span>
                        </div>
                        <div class="muscle-tags"><strong>Primary:</strong> ${exPrimary} | <strong>Secondary:</strong> ${exSecondary}</div>
                    `;

                    const rmBtn = li.querySelector('.remove-ex-btn');
                    rmBtn.addEventListener('mouseover', () => {
                        rmBtn.style.background = 'var(--secondary-accent)';
                        rmBtn.style.color = 'white';
                    });
                    rmBtn.addEventListener('mouseout', () => {
                        rmBtn.style.background = 'transparent';
                        rmBtn.style.color = 'var(--secondary-accent)';
                    });

                    rmBtn.addEventListener('click', () => {
                        appState.weeklyPlans[activeDay].exercises.splice(index, 1);
                        if (appState.weeklyPlans[activeDay].exercises.length === 0) {
                            delete appState.weeklyPlans[activeDay];
                        }
                        saveStateToCloud();
                        updateWorkoutUI(); 
                    });

                    planList.appendChild(li);
                    
                    const option = document.createElement('option');
                    option.value = exName;
                    option.textContent = exName;
                    exerciseSelect.appendChild(option);
                });
                
                dailyPlanContainer.appendChild(planList);
                logForm.querySelector('button').disabled = false;
                
            } else {
                dailyPlanContainer.innerHTML = `<p class="empty-state">No workout planned for ${activeDay}. Add exercises or generate a routine below!</p>`;
                const defaultOption = document.createElement('option');
                defaultOption.textContent = "Plan is empty";
                defaultOption.disabled = true;
                defaultOption.selected = true;
                exerciseSelect.appendChild(defaultOption);
                logForm.querySelector('button').disabled = true;
            }

            logOutput.innerHTML = '';
            
            if (todayLogs.length === 0) {
                logOutput.innerHTML = `<p class="empty-state">No sets logged yet for ${activeDay}.</p>`;
            } else {
                todayLogs.forEach((log, index) => {
                    const li = document.createElement('li');
                    li.style.display = 'flex';
                    li.style.justifyContent = 'space-between';
                    li.style.alignItems = 'center';
                    li.style.borderBottom = '1px dashed #ccc';
                    li.style.paddingBottom = '8px';
                    li.style.marginBottom = '8px';

                    li.innerHTML = `
                        <div>
                            <strong>${log.exercise}</strong>
                            <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                                <li>${log.sets} sets of ${log.reps} reps/mins @ ${log.weight} lbs/lvl</li>
                            </ul>
                        </div>
                        <button class="delete-btn" style="background: var(--secondary-accent); padding: 5px 10px; font-size: 0.8rem; border-radius: 4px; color: white; border: none; cursor: pointer;">Delete</button>
                    `;

                    li.querySelector('.delete-btn').addEventListener('click', () => {
                        appState.weeklyLogs[activeDay].splice(index, 1);
                        saveStateToCloud();
                        updateWorkoutUI(); 
                    });

                    logOutput.prepend(li);
                });
            }
        };

        addExerciseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const exName = document.getElementById('customExName').value;
            const sets = document.getElementById('customSets').value;
            const reps = document.getElementById('customReps').value;

            if (!appState.weeklyPlans[activeDay]) {
                appState.weeklyPlans[activeDay] = {
                    muscle: 'Custom Split',
                    location: 'Mixed',
                    exercises: []
                };
            }

            const existingIndex = appState.weeklyPlans[activeDay].exercises.findIndex(ex => {
                const name = typeof ex === 'string' ? ex : ex.name;
                return name.toLowerCase() === exName.toLowerCase();
            });

            const newExObj = {
                name: exName,
                volume: `${sets}x${reps}`,
                primary: "Custom Added",
                secondary: "N/A",
                targets: []
            };

            if (existingIndex >= 0) {
                appState.weeklyPlans[activeDay].exercises[existingIndex] = newExObj;
            } else {
                appState.weeklyPlans[activeDay].exercises.push(newExObj);
            }

            saveStateToCloud();
            updateWorkoutUI();
            addExerciseForm.reset();
        });


        generatorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const selectedPrimaryBoxes = document.querySelectorAll('input[name="primaryMuscle"]:checked');
            const selectedMuscles = Array.from(selectedPrimaryBoxes).map(cb => cb.value);
            
            if(selectedMuscles.length === 0) {
                alert("Please select at least one primary group to generate a routine.");
                return;
            }

            const location = document.getElementById('gymLocation').value;
            const strategy = document.querySelector('input[name="conflictStrategy"]:checked').value;
            
            const selectedDayCheckboxes = document.querySelectorAll('input[name="targetDays"]:checked');
            let targetDays = Array.from(selectedDayCheckboxes).map(cb => cb.value);

            const selectedSubMuscleBoxes = document.querySelectorAll('input[name="subMuscle"]:checked');
            let targetSubMuscles = Array.from(selectedSubMuscleBoxes).map(cb => cb.value);

            if (targetDays.length === 0) targetDays = [activeDay];

            let overwriteDays = [];
            targetDays.forEach(day => {
                if (appState.weeklyPlans[day] && appState.weeklyPlans[day].exercises && appState.weeklyPlans[day].exercises.length > 0) {
                    overwriteDays.push(day);
                }
            });

            if (strategy === 'replace' && overwriteDays.length > 0) {
                const confirmReplace = confirm(`You already have routines set for: ${overwriteDays.join(', ')}. Do you want to REPLACE them entirely?`);
                if (!confirmReplace) return;
            }

            let combinedExercises = [];
            
            selectedMuscles.forEach(muscle => {
                let exercisesForMuscle = exerciseDB[muscle][location];
                
                const validTargetsForThisMuscle = subMusclesOptions[muscle].map(opt => opt.id);
                const activeTargetsForThisMuscle = targetSubMuscles.filter(t => validTargetsForThisMuscle.includes(t));

                if(activeTargetsForThisMuscle.length > 0) {
                    const filtered = exercisesForMuscle.filter(ex => ex.targets.some(t => activeTargetsForThisMuscle.includes(t)));
                    if(filtered.length > 0) {
                        combinedExercises.push(...filtered);
                    } else {
                        combinedExercises.push(exercisesForMuscle[0]); 
                    }
                } else {
                    combinedExercises.push(...exercisesForMuscle);
                }
            });
            
            const jointTitle = selectedMuscles.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' & ');

            targetDays.forEach(day => {
                let currentPlan = appState.weeklyPlans[day];
                
                if (strategy === 'merge' && currentPlan && currentPlan.exercises && currentPlan.exercises.length > 0) {
                    
                    let newMuscleTitle = currentPlan.muscle;
                    if (!newMuscleTitle.includes(jointTitle)) {
                        newMuscleTitle += ` + ${jointTitle}`;
                    }

                    let existingExMap = new Map();
                    currentPlan.exercises.forEach(ex => {
                        const exName = typeof ex === 'string' ? ex : ex.name;
                        existingExMap.set(exName, ex);
                    });

                    combinedExercises.forEach(newEx => {
                        existingExMap.set(newEx.name, newEx);
                    });

                    appState.weeklyPlans[day] = {
                        muscle: newMuscleTitle,
                        location: location === 'john_wooden' ? 'UCLA Gym' : 'Home',
                        exercises: Array.from(existingExMap.values())
                    };

                } else {
                    appState.weeklyPlans[day] = {
                        muscle: jointTitle,
                        location: location === 'john_wooden' ? 'UCLA Gym' : 'Home',
                        exercises: [...combinedExercises]
                    };
                    appState.weeklyLogs[day] = []; 
                }
            });

            saveStateToCloud();
            
            selectedDayCheckboxes.forEach(cb => cb.checked = false);
            selectedSubMuscleBoxes.forEach(cb => cb.checked = false);
            
            if (targetDays.length > 0) activeDay = targetDays[0];
            
            updateWorkoutUI();
            renderWeekNav();
            alert(`Routine successfully applied to cloud for: ${targetDays.join(', ')}`);
        });

        logForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const exercise = document.getElementById('exerciseName').value;
            const sets = document.getElementById('sets').value;
            const reps = document.getElementById('reps').value;
            const weight = document.getElementById('weightLifted').value;

            if (!appState.weeklyLogs[activeDay]) {
                appState.weeklyLogs[activeDay] = [];
            }

            appState.weeklyLogs[activeDay].push({ exercise, sets, reps, weight });
            saveStateToCloud();
            
            document.getElementById('sets').value = 1;
            document.getElementById('reps').value = '';
            document.getElementById('weightLifted').value = '';
            
            updateWorkoutUI();
        });

        renderWeekNav();
        updateWorkoutUI();
    }
});