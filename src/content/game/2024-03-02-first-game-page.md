---
tags:
  - game
title: First Game Page
author: Huy Nguyen
pubDatetime: 2024-03-02T15:57:52.737Z
slug: first-game-page
featured: false
ogImage: https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png
description: first game page
---
```renderhtml
<div class="flex flex-wrap">
  <div class="w-full md:w-1/2 p-4">
    <!-- Right side: Game details -->
    <h1 class="text-4xl font-bold">SURVIVOR.io</h1>
    <h2 class="text-2xl font-bold mt-2">SURVIVE THE MONSTERS, SURVIVE THE FUN!</h2>
    <p class="mt-4">
      Dangerous zombies are attacking the entire city! The city is in peril! Awakened by the trial of dreams, you've no choice but to take on the heroic mantle of saving the city! As a human warrior with unlimited potential, you and other survivors will have to pick up your weapons and battle these evil and dangerous zombies!
    </p>
    <div class="mt-4">
      <!-- Download buttons -->
      <button class="bg-blue-500 text-white rounded p-2 mr-2">App Store</button>
      <button class="bg-green-500 text-white rounded p-2">Google Play</button>
    </div>
    <div class="mt-4 w-full md:w-1/2">
    <!-- Left side: Image of the character -->
    <img src="https://cdn-www.bluestacks.com/bs-images/159ce5c362e3c765529a48a2c4d7655e.png" alt="Character Image">
  </div>
  </div>
</div>
<!-- New component -->
<div class="flex flex-wrap mt-8">
  <div class="w-full md:w-1/2 p-4">
    <!-- Right side: Features list -->
    <h1 class="text-4xl font-bold">FEATURES</h1>
    <ul class="list-disc mt-4">
      <li>Face off against 3000+ monsters at once and exterminate them!</li>
      <li>Clear the map with one-hand controls!</li>
      <li>All-new roguelike auto experience with unlimited combinations!</li>
      <li>Feel the heat of each new stage with different difficulties!</li>
    </ul>
  </div>
</div>
```