var failures = ["I broke my diet.",
"I didn't work out at all this week.",
"I made myself throw up again.",
"I looked in the mirror and hated what I saw.",
"I let down my parents.",
"I tried to kill myself.",
"I got into a fight.",
"I made my girlfriend cry.",
"I ate lunch alone.",
"I got a speeding ticket.",
"I totaled my car.",
"I started another project that I didn't finish.",
"I lost my car keys.",
"I stole something.",
"I didn't eat anything yesterday.",
"I failed my calc test.",
"I got fired from my job.",
"I got my girlfriend pregnant.",
"I blacked out last night."];

failures.forEach(function(failure) {
  window.failuresDb.push({text: failure, userId: "1", meToos: Math.floor((Math.random()*10)+1)});
});
