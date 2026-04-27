const state = {
  data: null,
  screen: "opening",
  introLineIndex: 0,
  currentIssueId: null,
  currentSeedIssueId: null,
  selectedSlots: [null, null],
  activeResultType: null,
  activePenaltyType: null,
  isJudging: false,
  isShopEntering: false,
  isPenaltyFinishing: false,
  shopEntryTimer: null,
  catHairTimer: null,
  assetManifest: null,
  audioAssets: new Map(),
  audioCache: new Map(),
  cardFlow: {
    selectedCategory: "",
    selectedSubcategory: "",
  },
  collection: [],
  isCollectingSuccess: false,
};

const introLines = [
  "（哈欠）...又是这个点，又是这种味道。",
  "说吧，今晚是什么东西让你这只两脚兽消化不良？",
];

const sfxAssetIds = {
  click: "click-sfx",
  "door-bell": "door-bell-sfx",
  "sacrifice-bell": "sacrifice-bell-sfx",
  "judgement-smoke": "judgement-smoke-sfx",
  success: "success-sfx",
  "failure-slip": "failure-slip-sfx",
  "slip-tear": "failure-slip-tear-sfx",
};

const cardFlowTiming = {
  selectedMs: 140,
  transitionMs: 140,
  orbMs: 430,
};

const COLLECTION_STORAGE_KEY = "cat_fortune_v3_collection";
const collectionFlyMs = 720;

const FAILURE_PENALTY_FALLBACKS = [
  { id: "nonsense-slip", weight_percent: 50 },
  { id: "mud-paw", weight_percent: 25 },
  { id: "cat-hair", weight_percent: 25 },
];

const penaltyItemPositions = {
  "mud-paw": [
    { left: "18%", top: "28%", rotate: "-18deg", scale: "1" },
    { left: "64%", top: "24%", rotate: "14deg", scale: "0.92" },
    { left: "34%", top: "58%", rotate: "8deg", scale: "1.08" },
    { left: "76%", top: "62%", rotate: "-10deg", scale: "0.98" },
  ],
  "cat-hair": [
    { left: "14%", top: "22%", rotate: "-24deg", scale: "1" },
    { left: "38%", top: "18%", rotate: "18deg", scale: "0.9" },
    { left: "68%", top: "24%", rotate: "-8deg", scale: "1.08" },
    { left: "82%", top: "48%", rotate: "28deg", scale: "0.96" },
    { left: "22%", top: "56%", rotate: "12deg", scale: "1.1" },
    { left: "48%", top: "68%", rotate: "-16deg", scale: "0.94" },
    { left: "72%", top: "74%", rotate: "8deg", scale: "1" },
  ],
};

const SHOPKEEPER_LINES = {
  "ice-room": {
    default: "少冰？少熬夜才是真的。",
    hover: "冰室猫眯起眼：苦的、甜的、醒的，都在这排架子上。",
    click: [
      "别盯着奶茶桶发呆，先选食材。",
      "凌晨的冰室不收眼泪，只收配方。",
      "你看起来需要热奶茶，也可能只是需要睡觉。",
    ],
  },
  "street-stall": {
    default: "别站着发呆，鱼蛋不会自己跳进碗里。",
    hover: "大排档猫甩了甩毛巾：想转运，就别怕烟火气。",
    click: [
      "手快点，后面还有猫排队。",
      "咖喱酱很辣，但有些心事更辣。",
      "选错也没事，大不了猫大师嫌弃你一下。",
    ],
  },
  "dessert-station": {
    default: "甜的不能治百病，但能让你先坐一会儿。",
    hover: "甜品站猫轻轻眨眼：软糯的东西，最适合接住深夜。",
    click: [
      "别急，糖水要慢慢等。",
      "如果今晚睡不着，就先吃点温柔的。",
      "有些答案，藏在椰浆和汤圆之间。",
    ],
  },
};

const els = {
  openingScreen: document.getElementById("opening-screen"),
  enterDoorBtn: document.getElementById("enter-door-btn"),
  openingStatus: document.getElementById("opening-status"),
  catIntroScreen: document.getElementById("cat-intro-screen"),
  introDialogue: document.getElementById("intro-dialogue"),
  introContinueBtn: document.getElementById("intro-continue-btn"),
  startScreen: document.getElementById("start-screen"),
  seedSelectionPanel: document.getElementById("seed-selection-panel"),
  issueButtons: document.getElementById("issue-buttons"),
  expandedCardFlowBtn: document.getElementById("expanded-card-flow-btn"),
  cardFlowPanel: document.getElementById("card-flow-panel"),
  cardFlowBackBtn: document.getElementById("card-flow-back-btn"),
  cardFlowTitle: document.getElementById("card-flow-title"),
  cardFlowSubtitle: document.getElementById("card-flow-subtitle"),
  cardFlowGrid: document.getElementById("card-flow-grid"),
  cardFlowLightOrb: document.getElementById("card-flow-light-orb"),
  issuePlayScreen: document.getElementById("issue-play-screen"),
  issueTitle: document.getElementById("issue-play-title"),
  issueShopAnchor: document.getElementById("issue-shop-anchor"),
  catMaster: document.getElementById("cat-master"),
  riddleBox: document.getElementById("riddle-box"),
  shopUi: document.getElementById("shop-ui"),
  shopTabs: document.getElementById("shop-tabs"),
  ingredients: document.getElementById("ingredients"),
  sacrificeCounter: document.getElementById("sacrifice-counter"),
  sacrificeSlots: [
    document.getElementById("sacrifice-slot-0"),
    document.getElementById("sacrifice-slot-1"),
  ],
  submitBtn: document.getElementById("submit-btn"),
  feedback: document.getElementById("feedback"),
  shopEntryOverlay: document.getElementById("shop-entry-overlay"),
  shopEntrySign: document.getElementById("shop-entry-sign"),
  shopEntryDoor: document.getElementById("shop-entry-door"),
  shopEntryCaption: document.getElementById("shop-entry-caption"),
  judgementOverlay: document.getElementById("judgement-overlay"),
  judgementIngredientLeft: document.getElementById("judgement-ingredient-left"),
  judgementIngredientRight: document.getElementById("judgement-ingredient-right"),
  overlay: document.getElementById("overlay"),
  resultCard: document.getElementById("result-card"),
  resultEyebrow: document.getElementById("result-eyebrow"),
  foodResult: document.getElementById("food-result"),
  foodName: document.getElementById("food-name"),
  wisdomText: document.getElementById("wisdom-text"),
  collectionFeedback: document.getElementById("collection-feedback"),
  resultActionBtn: document.getElementById("result-action-btn"),
  collectionBookButton: document.getElementById("collection-book-button"),
  collectionBookCount: document.getElementById("collection-book-count"),
  collectionBookOverlay: document.getElementById("collection-book-overlay"),
  collectionBookClose: document.getElementById("collection-book-close"),
  collectionBookGrid: document.getElementById("collection-book-grid"),
  penaltyOverlay: document.getElementById("penalty-overlay"),
  penaltyCard: document.getElementById("penalty-card"),
  penaltyTitle: document.getElementById("penalty-title"),
  penaltyInstruction: document.getElementById("penalty-instruction"),
  penaltyStage: document.getElementById("penalty-stage"),
};

async function loadGameData() {
  const response = await fetch("./content/runtime-data.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`加载内容失败：${response.status}`);
  }
  return response.json();
}

async function loadAssetManifest() {
  try {
    const response = await fetch("./content/asset-manifest.json", { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    debugSfxWarning("asset-manifest", error);
    return null;
  }
}

function isLocalDebugHost() {
  return ["", "localhost", "127.0.0.1"].includes(window.location.hostname);
}

function debugSfxWarning(key, error) {
  if (!isLocalDebugHost()) return;
  console.debug(`[audio hook] ${key} skipped: ${error.message || error}`);
}

function preloadAudioAssets() {
  state.audioAssets.clear();
  state.audioCache.clear();

  if (!state.assetManifest || !Array.isArray(state.assetManifest.assets)) return;

  state.assetManifest.assets
    .filter((asset) => asset.type === "audio")
    .forEach((asset) => {
      state.audioAssets.set(asset.id, asset);

      if (asset.status !== "ready" || !asset.path) return;
      const audio = new Audio(asset.path);
      audio.preload = "auto";
      state.audioCache.set(asset.id, audio);
    });
}

function resolveAudioAssetPath(key) {
  const assetId = sfxAssetIds[key] || key;
  const asset = state.audioAssets.get(assetId);
  if (!asset || asset.type !== "audio" || asset.status !== "ready") return "";
  return asset.path || "";
}

function playSfx(key) {
  const assetId = sfxAssetIds[key] || key;
  const path = resolveAudioAssetPath(key);
  if (!path) return;

  try {
    const cachedAudio = state.audioCache.get(assetId);
    const audio = cachedAudio ? cachedAudio.cloneNode(true) : new Audio(path);
    audio.volume = 0.65;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => debugSfxWarning(key, error));
    }
  } catch (error) {
    debugSfxWarning(key, error);
  }
}

function getIssueById(issueId) {
  return state.data.issues.find((issue) => issue.id === issueId);
}

function getSeedIssueById(issueId) {
  return state.data.seed_issues.find((issue) => issue.issue_id === issueId);
}

function getShopById(shopId) {
  return state.data.shops.find((shop) => shop.id === shopId);
}

function getIngredientById(ingredientId) {
  return state.data.ingredients.find((ingredient) => ingredient.id === ingredientId);
}

function getHintById(hintId) {
  return state.data.half_success_hints.find((hint) => hint.id === hintId);
}

function getWisdomById(wisdomId) {
  return state.data.success_wisdom.find((wisdom) => wisdom.id === wisdomId);
}

function normalizeCollectionEntry(entry) {
  if (!entry || !entry.issue_id || !entry.food_name || !entry.wisdom_text) return null;
  return {
    issue_id: String(entry.issue_id),
    display_title: String(entry.display_title || ""),
    food_name: String(entry.food_name),
    wisdom_text: String(entry.wisdom_text),
    shop_id: String(entry.shop_id || ""),
    collected_at: String(entry.collected_at || new Date().toISOString()),
  };
}

function loadCollection() {
  try {
    const raw = window.localStorage?.getItem(COLLECTION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeCollectionEntry).filter(Boolean);
  } catch (error) {
    debugSfxWarning("collection-load", error);
    return [];
  }
}

function saveCollection(collection) {
  try {
    window.localStorage?.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collection));
    return true;
  } catch (error) {
    debugSfxWarning("collection-save", error);
    return false;
  }
}

function getCollectionEntries() {
  return Array.isArray(state.collection) ? state.collection : [];
}

function isCollected(issueId) {
  return getCollectionEntries().some((entry) => entry.issue_id === issueId);
}

function addToCollection(entry) {
  const normalizedEntry = normalizeCollectionEntry(entry);
  if (!normalizedEntry) {
    return { added: false, duplicate: false, saved: false, entry: null };
  }

  const collection = [...getCollectionEntries()];
  const existingIndex = collection.findIndex((item) => item.issue_id === normalizedEntry.issue_id);
  const duplicate = existingIndex !== -1;

  if (duplicate) {
    collection[existingIndex] = {
      ...collection[existingIndex],
      ...normalizedEntry,
      collected_at: normalizedEntry.collected_at,
    };
  } else {
    collection.unshift(normalizedEntry);
  }

  state.collection = collection;
  const saved = saveCollection(collection);
  return { added: true, duplicate, saved, entry: normalizedEntry };
}

function formatCollectedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
}

function updateCollectionButton() {
  const count = getCollectionEntries().length;
  els.collectionBookCount.textContent = String(count);
  els.collectionBookCount.setAttribute("aria-label", `已收藏 ${count} 张`);
  els.collectionBookButton.classList.toggle("has-items", count > 0);
  els.collectionBookButton.setAttribute("aria-label", `打开收藏账本，已收藏 ${count} 张`);
}

function pulseCollectionButton() {
  els.collectionBookButton.classList.remove("is-pulsing");
  window.requestAnimationFrame(() => {
    els.collectionBookButton.classList.add("is-pulsing");
  });
  window.setTimeout(() => {
    els.collectionBookButton.classList.remove("is-pulsing");
  }, 620);
}

function buildCurrentCollectionEntry() {
  const issue = getIssueById(state.currentIssueId);
  if (!issue) return null;
  const wisdom = getWisdomById(issue.success_wisdom_id);

  return {
    issue_id: issue.id,
    display_title: getIssueDisplayTitle(issue),
    food_name: issue.food_name || els.foodName.textContent || "深夜夜宵",
    wisdom_text: wisdom?.text || els.wisdomText.textContent || "猫大师点点头，但这份智慧还没写好。",
    shop_id: issue.shop_id || "",
    collected_at: new Date().toISOString(),
  };
}

function createCollectionCard(entry) {
  const card = document.createElement("article");
  card.className = "collection-card";

  const foodName = document.createElement("h4");
  foodName.textContent = entry.food_name;
  const issueTitle = document.createElement("div");
  issueTitle.className = "collection-card-issue";
  issueTitle.textContent = entry.display_title || "未命名心绪";
  const wisdom = document.createElement("p");
  wisdom.textContent = entry.wisdom_text;
  const date = document.createElement("div");
  date.className = "collection-card-date";
  date.textContent = formatCollectedDate(entry.collected_at);

  card.append(foodName, issueTitle, wisdom);
  if (date.textContent) card.appendChild(date);
  return card;
}

function renderCollectionBook() {
  els.collectionBookGrid.innerHTML = "";
  const entries = getCollectionEntries();

  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "collection-book-empty";
    empty.textContent = "账本还空着。先把一道夜宵的智慧带走吧。";
    els.collectionBookGrid.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    els.collectionBookGrid.appendChild(createCollectionCard(entry));
  });
}

function openCollectionBook() {
  playSfx("click");
  renderCollectionBook();
  els.collectionBookOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    els.collectionBookOverlay.classList.add("is-visible");
  });
}

function closeCollectionBook() {
  playSfx("click");
  els.collectionBookOverlay.classList.remove("is-visible");
  window.setTimeout(() => {
    if (!els.collectionBookOverlay.classList.contains("is-visible")) {
      els.collectionBookOverlay.hidden = true;
    }
  }, 160);
}

function flySuccessCardToBook() {
  updateCollectionButton();

  if (prefersReducedMotion()) {
    pulseCollectionButton();
    return Promise.resolve();
  }

  const startRect = els.resultCard.getBoundingClientRect();
  const endRect = els.collectionBookButton.getBoundingClientRect();
  const startX = startRect.left + (startRect.width / 2);
  const startY = startRect.top + (startRect.height / 2);
  const endX = endRect.left + (endRect.width / 2);
  const endY = endRect.top + (endRect.height / 2);
  const flyCard = document.createElement("div");
  flyCard.className = "collection-fly-card";
  flyCard.textContent = els.foodName.textContent || "智慧";
  flyCard.style.left = `${startX}px`;
  flyCard.style.top = `${startY}px`;
  flyCard.style.setProperty("--fly-x", `${endX - startX}px`);
  flyCard.style.setProperty("--fly-y", `${endY - startY}px`);
  document.body.appendChild(flyCard);

  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      flyCard.remove();
      pulseCollectionButton();
      resolve();
    };

    flyCard.addEventListener("animationend", finish, { once: true });
    window.setTimeout(finish, collectionFlyMs + 120);
  });
}

function countItems(items) {
  return items.reduce((counts, item) => {
    counts.set(item, (counts.get(item) || 0) + 1);
    return counts;
  }, new Map());
}

function recipeMatches(selection, recipe) {
  const selectedCounts = countItems(selection);
  const recipeCounts = countItems(recipe);

  for (const [ingredientId, needed] of recipeCounts) {
    if ((selectedCounts.get(ingredientId) || 0) < needed) {
      return false;
    }
  }
  return selection.length === recipe.length;
}

function countMatchedIngredients(selection, recipe) {
  const selectedCounts = countItems(selection);
  const recipeCounts = countItems(recipe);
  let total = 0;

  for (const [ingredientId, selected] of selectedCounts) {
    total += Math.min(selected, recipeCounts.get(ingredientId) || 0);
  }

  return total;
}

function setScreen(screen) {
  const selectionScreens = ["seed_selection", "category_selection", "subcategory_selection", "issue_selection"];
  const isCardFlowScreen = ["category_selection", "subcategory_selection", "issue_selection"].includes(screen);

  state.screen = screen;
  els.openingScreen.hidden = screen !== "opening";
  els.catIntroScreen.hidden = screen !== "cat_intro";
  els.startScreen.style.display = selectionScreens.includes(screen) ? "flex" : "none";
  els.seedSelectionPanel.hidden = screen !== "seed_selection";
  els.cardFlowPanel.hidden = !isCardFlowScreen;
  els.cardFlowPanel.classList.toggle("is-oracle-mode", isCardFlowScreen);
  els.overlay.style.display = screen === "result" ? "flex" : "none";
}

function getShopEntryVariant(shopId) {
  const variants = {
    "ice-room": {
      className: "ice-room",
      caption: "冷气一开，夜晚暂时安静下来。",
    },
    "street-stall": {
      className: "street-stall",
      caption: "油烟和霓虹一起翻涌，猫大师朝你挥了挥爪。",
    },
    "dessert-station": {
      className: "dessert-station",
      caption: "甜味从玻璃门后慢慢漫出来。",
    },
  };

  return variants[shopId] || {
    className: "unknown-shop",
    caption: "猫大师把小店的灯慢慢点亮。",
  };
}

function showShopEntryTransition(shop) {
  const variant = getShopEntryVariant(shop?.id || "");
  els.shopEntrySign.textContent = shop?.name || "深夜小店";
  els.shopEntryCaption.textContent = variant.caption;
  els.shopEntryOverlay.className = `shop-entry-overlay ${variant.className}`;
  els.shopEntryOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    els.shopEntryOverlay.classList.add("is-visible");
  });
}

function hideShopEntryTransition(immediate = false) {
  els.shopEntryOverlay.classList.remove("is-visible");
  if (immediate) {
    els.shopEntryOverlay.hidden = true;
    return;
  }

  window.setTimeout(() => {
    if (!els.shopEntryOverlay.classList.contains("is-visible")) {
      els.shopEntryOverlay.hidden = true;
    }
  }, 180);
}

function getFailurePenaltyOptions() {
  const runtimePenalties = Array.isArray(state.data?.failure_penalties)
    ? state.data.failure_penalties
    : [];
  const allowedIds = new Set(FAILURE_PENALTY_FALLBACKS.map((penalty) => penalty.id));
  const options = runtimePenalties
    .filter((penalty) => allowedIds.has(penalty.id))
    .map((penalty) => ({
      id: penalty.id,
      weight_percent: Number(penalty.weight_percent) || 0,
    }))
    .filter((penalty) => penalty.weight_percent > 0);

  return options.length ? options : FAILURE_PENALTY_FALLBACKS;
}

function selectFailurePenalty() {
  const options = getFailurePenaltyOptions();
  const totalWeight = options.reduce((sum, penalty) => sum + penalty.weight_percent, 0);
  let roll = Math.random() * totalWeight;

  for (const penalty of options) {
    roll -= penalty.weight_percent;
    if (roll <= 0) return penalty.id;
  }

  return options[0]?.id || "nonsense-slip";
}

function hidePenaltyOverlay() {
  els.penaltyOverlay.classList.remove("is-visible", "mud-paw", "cat-hair");
  els.penaltyOverlay.hidden = true;
  els.penaltyStage.innerHTML = "";
}

function clearCatHairTimer() {
  if (!state.catHairTimer) return;
  window.clearTimeout(state.catHairTimer);
  state.catHairTimer = null;
}

function finishFailurePenalty() {
  if (state.isPenaltyFinishing) return;
  state.isPenaltyFinishing = true;
  clearCatHairTimer();
  hidePenaltyOverlay();
  state.activePenaltyType = null;
  state.screen = "issue_play";
  resetSelection("已清空托盘，可以重新选择两味食材。");
}

function showPenaltyOverlay(type, title, instruction) {
  state.activePenaltyType = type;
  state.isPenaltyFinishing = false;
  state.screen = "failure_penalty";
  els.penaltyTitle.textContent = title;
  els.penaltyInstruction.textContent = instruction;
  els.penaltyStage.innerHTML = "";
  els.penaltyOverlay.className = `penalty-overlay ${type}`;
  els.penaltyCard.className = `penalty-card ${type}`;
  els.penaltyOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    els.penaltyOverlay.classList.add("is-visible");
  });
}

function handlePenaltyItemClick(item) {
  if (state.isPenaltyFinishing || item.classList.contains("is-cleared")) return;
  playSfx("click");
  item.classList.add("is-cleared");
  item.disabled = true;

  const remainingItems = els.penaltyStage.querySelectorAll(".penalty-item:not(.is-cleared)");
  if (!remainingItems.length) {
    finishFailurePenalty();
  }
}

function createPenaltyItem(type, text, position, index) {
  const item = document.createElement("button");
  item.className = `penalty-item ${type === "mud-paw" ? "mud-paw-mark" : "cat-hair-strand"}`;
  item.type = "button";
  item.textContent = text;
  item.style.left = position.left;
  item.style.top = position.top;
  item.style.setProperty("--penalty-rotate", position.rotate);
  item.style.setProperty("--penalty-scale", position.scale);
  item.style.setProperty("--penalty-index", index);
  item.setAttribute("aria-label", type === "mud-paw" ? "擦掉猫爪印" : "赶走猫毛");
  item.addEventListener("click", () => handlePenaltyItemClick(item));
  return item;
}

function renderPenaltyItems(type, text, positions) {
  const field = document.createElement("div");
  field.className = `penalty-field ${type}`;
  positions.forEach((position, index) => {
    field.appendChild(createPenaltyItem(type, text, position, index));
  });
  els.penaltyStage.appendChild(field);
}

function filledSlotIds() {
  return state.selectedSlots.filter(Boolean);
}

function updateSacrificeSlots() {
  const filledCount = filledSlotIds().length;

  state.selectedSlots.forEach((ingredientId, index) => {
    const slot = els.sacrificeSlots[index];
    const label = slot.querySelector(".slot-label");
    const value = slot.querySelector(".slot-value");
    const ingredient = ingredientId ? getIngredientById(ingredientId) : null;

    label.textContent = `献祭槽 ${index + 1}`;
    value.textContent = ingredient ? ingredient.name : "等待食材";
    slot.classList.toggle("filled", Boolean(ingredientId));
    slot.classList.toggle("is-judging", state.isJudging && Boolean(ingredientId));
    slot.setAttribute("aria-label", ingredient ? `移除 ${ingredient.name}` : `献祭槽 ${index + 1}，等待食材`);
  });

  els.submitBtn.classList.toggle("ready", filledCount === 2);
  els.submitBtn.classList.toggle("is-judging", state.isJudging);
  els.submitBtn.disabled = state.isJudging;
  els.submitBtn.setAttribute("aria-disabled", filledCount === 2 && !state.isJudging ? "false" : "true");
}

function animateCat() {
  els.catMaster.style.transform = "scale(1.12)";
  window.setTimeout(() => {
    els.catMaster.style.transform = "scale(1)";
  }, 160);
}

function resetSelection(message = "") {
  state.selectedSlots = [null, null];
  updateSacrificeSlots();
  renderIngredients();
  els.feedback.textContent = message;
}

function getMoodCardSubtitle(seedIssue) {
  if (seedIssue.subtitle) return seedIssue.subtitle;
  if (seedIssue.mood_subtitle) return seedIssue.mood_subtitle;
  if (seedIssue.ui_subtitle) return seedIssue.ui_subtitle;

  const title = seedIssue.title || "";
  if (title.includes("Deadline")) return "雨夜赶工，心跳比霓虹还急。";
  if (title.includes("嫉妒")) return "别人的光太亮，自己的胃有点酸。";
  if (title.includes("短板")) return "把不够好的地方，先放到猫爪边。";
  if (title.includes("熬夜")) return "越困越清醒，像一盏不肯灭的灯。";
  if (title.includes("倒霉")) return "坏运气黏在鞋底，等一阵热气冲散。";
  return "把今晚说不出口的心结，交给猫大师闻闻。";
}

function getMoodCardSymbol(seedIssue, index) {
  const title = seedIssue.title || "";
  if (title.includes("Deadline")) return "☕";
  if (title.includes("嫉妒")) return "✦";
  if (title.includes("短板")) return "◐";
  if (title.includes("熬夜")) return "☾";
  if (title.includes("倒霉")) return "◇";
  return ["✦", "☾", "◇", "◐", "☕"][index % 5];
}

function resetMoodCardSelection() {
  els.issueButtons.querySelectorAll(".mood-card").forEach((card) => {
    card.classList.remove("is-selected");
    card.disabled = false;
    card.setAttribute("aria-pressed", "false");
  });
}

function selectMoodCard(card, issueId) {
  playSfx("click");
  els.issueButtons.querySelectorAll(".mood-card").forEach((item) => {
    item.classList.toggle("is-selected", item === card);
    item.disabled = true;
    item.setAttribute("aria-pressed", item === card ? "true" : "false");
  });

  window.setTimeout(() => startGame(issueId), 180);
}

function renderIssueButtons() {
  els.issueButtons.innerHTML = "";

  state.data.seed_issues.forEach((seedIssue, index) => {
    const button = document.createElement("button");
    button.className = "mood-card";
    button.type = "button";
    button.dataset.issueId = seedIssue.issue_id;
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `选择心结：${seedIssue.title}`);

    const symbol = document.createElement("span");
    symbol.className = "mood-card-symbol";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = getMoodCardSymbol(seedIssue, index);

    const content = document.createElement("span");
    content.className = "mood-card-content";

    const title = document.createElement("span");
    title.className = "mood-card-title";
    title.textContent = seedIssue.title;

    const subtitle = document.createElement("span");
    subtitle.className = "mood-card-subtitle";
    subtitle.textContent = getMoodCardSubtitle(seedIssue);

    content.append(title, subtitle);
    button.append(symbol, content);
    button.addEventListener("click", () => selectMoodCard(button, seedIssue.issue_id));
    els.issueButtons.appendChild(button);
  });
}

function clearCardFlowGrid() {
  els.cardFlowGrid.innerHTML = "";
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
}

function markCardFlowCardsForEnter() {
  if (prefersReducedMotion()) return;

  els.cardFlowGrid
    .querySelectorAll(".emotion-category-card, .emotion-subcategory-card, .emotion-issue-card, .card-flow-note")
    .forEach((card, index) => {
      card.classList.add("card-flow-card-enter");
      card.style.setProperty("--card-flow-index", index);
    });
}

function resetCardFlowLightOrb() {
  els.cardFlowLightOrb.classList.remove("is-visible");
  els.cardFlowPanel.classList.remove("is-collapsing-card");
}

function transitionCardFlow(renderNext) {
  if (prefersReducedMotion() || els.cardFlowPanel.hidden) {
    resetCardFlowLightOrb();
    renderNext();
    markCardFlowCardsForEnter();
    return;
  }

  resetCardFlowLightOrb();
  els.cardFlowPanel.classList.add("is-transitioning");
  window.setTimeout(() => {
    renderNext();
    els.cardFlowPanel.classList.remove("is-transitioning");
    markCardFlowCardsForEnter();
  }, cardFlowTiming.transitionMs);
}

function selectCardThen(card, action) {
  playSfx("click");

  if (card) {
    card.classList.add("is-selected");
    card.setAttribute("aria-pressed", "true");
  }

  if (prefersReducedMotion()) {
    action();
    return;
  }

  window.setTimeout(action, cardFlowTiming.selectedMs);
}

function setLightOrbPosition(card) {
  const panelRect = els.cardFlowPanel.getBoundingClientRect();
  const cardRect = card?.getBoundingClientRect();
  const x = cardRect ? cardRect.left + (cardRect.width / 2) - panelRect.left : panelRect.width / 2;
  const y = cardRect ? cardRect.top + (cardRect.height / 2) - panelRect.top : panelRect.height / 2;

  els.cardFlowLightOrb.style.setProperty("--orb-x", `${x}px`);
  els.cardFlowLightOrb.style.setProperty("--orb-y", `${y}px`);
}

function selectIssueCard(card, issueId) {
  playSfx("click");

  if (card) {
    card.classList.add("is-selected", "is-collapsing");
    card.setAttribute("aria-pressed", "true");
  }

  if (prefersReducedMotion()) {
    startGame(issueId);
    return;
  }

  setLightOrbPosition(card);
  els.cardFlowPanel.classList.add("is-collapsing-card");
  els.cardFlowLightOrb.classList.add("is-visible");
  window.setTimeout(() => startGame(issueId), cardFlowTiming.orbMs);
}

function createCardFlowButton(className, titleText, subtitleText, onClick, options = {}) {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.setAttribute("aria-label", titleText);
  button.setAttribute("aria-pressed", "false");

  if (options.symbol) {
    const symbol = document.createElement("span");
    symbol.className = "card-flow-card-symbol";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = options.symbol;
    button.appendChild(symbol);
  }

  const title = document.createElement("span");
  title.className = "card-flow-card-title";
  title.textContent = titleText;
  const subtitle = document.createElement("span");
  subtitle.className = "card-flow-card-subtitle";
  subtitle.textContent = subtitleText;

  button.append(title, subtitle);
  button.addEventListener("click", () => onClick(button));
  return button;
}

function appendCardFlowNote(text) {
  const note = document.createElement("div");
  note.className = "card-flow-note";
  note.textContent = text;
  els.cardFlowGrid.appendChild(note);
}

function appendCardFlowEmpty(text) {
  const empty = document.createElement("div");
  empty.className = "card-flow-empty";
  const title = document.createElement("div");
  title.className = "card-flow-empty-title";
  title.textContent = text;
  empty.appendChild(title);
  els.cardFlowGrid.appendChild(empty);
}

function getPublicCardFlowItems() {
  const items = state.data?.card_flow?.items;
  if (!Array.isArray(items)) return [];

  return items.filter((item) => (
    item
    && item.is_public === true
    && item.issue_id
    && item.display_title
    && item.level1
    && item.level2
  ));
}

function countUnique(values) {
  return new Set(values.filter(Boolean)).size;
}

function getCardFlowCategorySymbol(title, index) {
  if (title.includes("职场") || title.includes("学业")) return "☕";
  if (title.includes("关系") || title.includes("亲密")) return "♡";
  if (title.includes("自我") || title.includes("情绪")) return "◐";
  if (title.includes("生活") || title.includes("节奏")) return "☾";
  if (title.includes("欲望") || title.includes("金钱")) return "◇";
  return ["✦", "☾", "◇", "◐", "☕"][index % 5];
}

function getCardFlowCategories() {
  const groups = new Map();

  getPublicCardFlowItems().forEach((item) => {
    if (!groups.has(item.level1)) {
      groups.set(item.level1, []);
    }
    groups.get(item.level1).push(item);
  });

  return Array.from(groups, ([title, items], index) => ({
    id: title,
    title,
    items,
    symbol: getCardFlowCategorySymbol(title, index),
    subtitle: `${countUnique(items.map((item) => item.level2))} 个方向 / ${items.length} 张心绪卡`,
  }));
}

function getCardFlowCategory(categoryId) {
  return getCardFlowCategories().find((category) => category.id === categoryId) || null;
}

function getCardFlowSubcategories(categoryId) {
  const category = getCardFlowCategory(categoryId);
  if (!category) return [];

  const groups = new Map();
  category.items.forEach((item) => {
    if (!groups.has(item.level2)) {
      groups.set(item.level2, []);
    }
    groups.get(item.level2).push(item);
  });

  return Array.from(groups, ([title, items]) => ({
    id: title,
    title,
    items,
    subtitle: `${items.length} 张心绪卡`,
  }));
}

function getCardFlowSubcategory(categoryId, subcategoryId) {
  return getCardFlowSubcategories(categoryId).find((subcategory) => subcategory.id === subcategoryId) || null;
}

function getCardFlowTitleByIssueId(issueId) {
  return getPublicCardFlowItems().find((item) => item.issue_id === issueId)?.display_title || "";
}

function renderCategorySelection() {
  const categories = getCardFlowCategories();

  setScreen("category_selection");
  els.cardFlowBackBtn.textContent = "返回五张默认卡";
  els.cardFlowTitle.textContent = "选择一种心绪方向";
  els.cardFlowSubtitle.textContent = categories.length
    ? "让猫大师先按大类闻一闻今晚的心事。"
    : "完整心绪卡牌正在整理中，本版本先保留五个默认心结。";
  clearCardFlowGrid();

  if (!categories.length) {
    appendCardFlowEmpty("完整心绪卡牌正在整理中，本版本先保留五个默认心结。");
    return;
  }

  categories.forEach((category) => {
    const card = createCardFlowButton(
      "emotion-category-card",
      category.title,
      category.subtitle,
      (card) => selectCardThen(card, () => transitionCardFlow(() => renderSubcategorySelection(category.id))),
      { symbol: category.symbol },
    );
    els.cardFlowGrid.appendChild(card);
  });
}

function showCategorySelection() {
  playSfx("click");
  state.cardFlow.selectedCategory = "";
  state.cardFlow.selectedSubcategory = "";
  transitionCardFlow(renderCategorySelection);
}

function renderSubcategorySelection(categoryId) {
  const category = getCardFlowCategory(categoryId);
  if (!category) {
    renderCategorySelection();
    return;
  }
  const subcategories = getCardFlowSubcategories(categoryId);

  state.cardFlow.selectedCategory = categoryId;
  state.cardFlow.selectedSubcategory = "";
  setScreen("subcategory_selection");
  els.cardFlowBackBtn.textContent = "返回分类";
  els.cardFlowTitle.textContent = category.title;
  els.cardFlowSubtitle.textContent = category.subtitle;
  clearCardFlowGrid();

  if (!subcategories.length) {
    appendCardFlowEmpty("这个方向的心绪卡还在整理中。");
    return;
  }

  subcategories.forEach((direction) => {
    const card = createCardFlowButton(
      "emotion-subcategory-card",
      direction.title,
      direction.subtitle,
      (card) => selectCardThen(card, () => transitionCardFlow(() => renderIssueSelection(category.id, direction.id))),
    );
    els.cardFlowGrid.appendChild(card);
  });
}

function showSubcategorySelection(categoryId) {
  playSfx("click");
  transitionCardFlow(() => renderSubcategorySelection(categoryId));
}

function getIssueDisplayTitle(issue) {
  const cardFlowTitle = getCardFlowTitleByIssueId(issue.id);
  if (cardFlowTitle) return cardFlowTitle;
  const seedIssue = getSeedIssueById(issue.id);
  if (issue.title) return issue.title;
  if (seedIssue?.title) return seedIssue.title;
  return "未命名心绪（临时整理中）";
}

function renderIssueSelection(categoryId, subcategoryId) {
  const category = getCardFlowCategory(categoryId);
  const direction = getCardFlowSubcategory(categoryId, subcategoryId);
  if (!category || !direction) {
    renderCategorySelection();
    return;
  }

  state.cardFlow.selectedCategory = categoryId;
  state.cardFlow.selectedSubcategory = subcategoryId;
  setScreen("issue_selection");
  els.cardFlowBackBtn.textContent = "返回方向";
  els.cardFlowTitle.textContent = direction.title;
  els.cardFlowSubtitle.textContent = "选择一张具体心绪卡";
  clearCardFlowGrid();

  if (!direction.items.length) {
    appendCardFlowEmpty("这个方向的心绪卡还在整理中。");
    return;
  }

  direction.items.forEach((issue) => {
    const card = createCardFlowButton(
      "emotion-issue-card",
      issue.display_title,
      "让猫大师闻闻这件事",
      (card) => selectIssueCard(card, issue.issue_id),
    );
    els.cardFlowGrid.appendChild(card);
  });
}

function showIssueSelection(categoryId, subcategoryId) {
  playSfx("click");
  transitionCardFlow(() => renderIssueSelection(categoryId, subcategoryId));
}

function handleCardFlowBack() {
  playSfx("click");
  if (state.screen === "issue_selection") {
    transitionCardFlow(() => renderSubcategorySelection(state.cardFlow.selectedCategory));
    return;
  }

  if (state.screen === "subcategory_selection") {
    transitionCardFlow(renderCategorySelection);
    return;
  }

  showSeedSelection();
}

function startIntro() {
  playSfx("door-bell");
  state.introLineIndex = 0;
  els.introDialogue.textContent = introLines[state.introLineIndex];
  els.introContinueBtn.textContent = "继续";
  setScreen("cat_intro");
}

function continueIntro() {
  playSfx("click");
  if (state.introLineIndex === 0) {
    state.introLineIndex = 1;
    els.introDialogue.textContent = introLines[state.introLineIndex];
    els.introContinueBtn.textContent = "选心结";
    return;
  }

  showSeedSelection();
}

function showSeedSelection() {
  if (state.shopEntryTimer) {
    window.clearTimeout(state.shopEntryTimer);
    state.shopEntryTimer = null;
  }
  clearCatHairTimer();
  state.isShopEntering = false;
  state.isPenaltyFinishing = false;
  state.activePenaltyType = null;
  hideShopEntryTransition(true);
  hidePenaltyOverlay();
  state.currentIssueId = null;
  state.currentSeedIssueId = null;
  state.selectedSlots = [null, null];
  state.isJudging = false;
  state.cardFlow.selectedCategory = "";
  state.cardFlow.selectedSubcategory = "";
  resetCardFlowLightOrb();
  hideJudgementOverlay(true);
  els.issueTitle.textContent = "选一个你此刻的心结";
  els.issueShopAnchor.textContent = "店铺还没亮灯";
  els.riddleBox.textContent = "选一个你此刻的心结，猫大师才肯开口。";
  els.feedback.textContent = "";
  els.shopTabs.innerHTML = "";
  els.ingredients.innerHTML = "";
  delete els.shopUi.dataset.shopId;
  delete els.shopUi.dataset.shopAssetId;
  delete els.shopUi.dataset.shopkeeperAssetId;
  updateSacrificeSlots();
  resetMoodCardSelection();
  setScreen("seed_selection");
}

function getCurrentPlayContext() {
  const issue = getIssueById(state.currentIssueId);
  const seedIssue = getSeedIssueById(state.currentSeedIssueId || state.currentIssueId);
  const shopId = seedIssue?.shop_id || issue?.shop_id || "";
  const shop = getShopById(shopId);
  const recipeIngredientIds = issue?.recipe_ingredient_ids || seedIssue?.recipe_ingredient_ids || [];
  const availableIngredientIds = seedIssue
    ? uniqueIngredientIds([
      ...((shopId && state.data.ingredients_by_shop[shopId]) || []),
      ...recipeIngredientIds,
    ])
    : uniqueIngredientIds(issue?.available_ingredient_ids || recipeIngredientIds);

  return { issue, seedIssue, shop, shopId, recipeIngredientIds, availableIngredientIds };
}

function uniqueIngredientIds(ingredientIds) {
  return Array.from(new Set(ingredientIds.filter(Boolean)));
}

function getShopSceneAssetId(shopId) {
  const assetIds = {
    "dessert-station": "shop-bg-dessert-night",
    "ice-room": "shop-bg-tea-night",
    "street-stall": "shop-bg-noodle-night",
  };
  return assetIds[shopId] || "";
}

function getShopkeeperAssetId(shopId) {
  const assetIds = {
    "dessert-station": "shopkeeper-dessert-idle",
    "ice-room": "shopkeeper-tea-idle",
    "street-stall": "shopkeeper-noodle-idle",
  };
  return assetIds[shopId] || "";
}

function getShopkeeperLines(shopId) {
  return SHOPKEEPER_LINES[shopId] || {
    default: "猫店员看了看你，又看了看食材架。",
    hover: "猫店员轻轻敲了敲柜台，示意你先选两味食材。",
    click: [
      "别紧张，配方会自己露出尾巴。",
      "先选食材，剩下的交给猫大师。",
      "深夜小店只收心事，不收解释。",
    ],
  };
}

function setShopkeeperLine(shopkeeper, lineEl, text) {
  shopkeeper.dataset.currentLine = text;
  lineEl.textContent = text;
}

function renderShopDisplay() {
  els.shopTabs.innerHTML = "";
  const { shop } = getCurrentPlayContext();
  if (!shop) return;

  const shopSceneAssetId = getShopSceneAssetId(shop.id);
  const shopkeeperAssetId = getShopkeeperAssetId(shop.id);
  els.shopUi.dataset.shopId = shop.id;
  els.shopUi.dataset.shopAssetId = shopSceneAssetId;
  els.shopUi.dataset.shopkeeperAssetId = shopkeeperAssetId;

  const card = document.createElement("div");
  card.className = "shop-card";
  card.dataset.shopId = shop.id;
  card.dataset.shopAssetId = shopSceneAssetId;
  card.dataset.shopkeeperAssetId = shopkeeperAssetId;

  const signboard = document.createElement("div");
  signboard.className = "shop-signboard";
  const signKicker = document.createElement("div");
  signKicker.className = "shop-sign-kicker";
  signKicker.textContent = shop.short_name || "深夜铺位";
  const name = document.createElement("div");
  name.className = "shop-name";
  name.textContent = shop.name;
  signboard.append(signKicker, name);

  const interior = document.createElement("div");
  interior.className = "shop-interior-identity";

  const copy = document.createElement("div");
  copy.className = "shop-copy";
  const desc = document.createElement("div");
  desc.className = "shop-desc";
  desc.textContent = shop.description;
  const meta = document.createElement("div");
  meta.className = "shop-meta";
  meta.textContent = `店员：${shop.npc} / 门型：${shop.door_type}`;
  copy.append(desc, meta);

  const shopkeeper = document.createElement("div");
  shopkeeper.className = "shopkeeper-placeholder";
  shopkeeper.dataset.shopkeeperAssetId = shopkeeperAssetId;
  shopkeeper.dataset.clickIndex = "0";
  shopkeeper.tabIndex = 0;
  shopkeeper.setAttribute("role", "button");
  shopkeeper.setAttribute("aria-label", `与${shop.npc || "店员猫"}互动`);
  const shopkeeperCat = document.createElement("div");
  shopkeeperCat.className = "shopkeeper-cat";
  shopkeeperCat.setAttribute("aria-hidden", "true");
  shopkeeperCat.textContent = "🐱";
  const shopkeeperNote = document.createElement("div");
  shopkeeperNote.className = "shopkeeper-note";
  shopkeeperNote.textContent = shop.npc || "店员猫";
  const shopkeeperLine = document.createElement("div");
  shopkeeperLine.className = "shopkeeper-line";
  shopkeeperLine.setAttribute("aria-live", "polite");

  const lines = getShopkeeperLines(shop.id);
  setShopkeeperLine(shopkeeper, shopkeeperLine, lines.default);

  const showHoverLine = () => {
    shopkeeperLine.textContent = lines.hover;
  };
  const restoreCurrentLine = () => {
    shopkeeperLine.textContent = shopkeeper.dataset.currentLine || lines.default;
  };
  const speakNextLine = () => {
    const clickLines = lines.click.length ? lines.click : [lines.default];
    const currentIndex = Number(shopkeeper.dataset.clickIndex || 0);
    const nextLine = clickLines[currentIndex % clickLines.length];
    shopkeeper.dataset.clickIndex = String((currentIndex + 1) % clickLines.length);
    setShopkeeperLine(shopkeeper, shopkeeperLine, nextLine);
    shopkeeper.classList.remove("is-speaking");
    window.requestAnimationFrame(() => {
      shopkeeper.classList.add("is-speaking");
    });
    window.setTimeout(() => {
      shopkeeper.classList.remove("is-speaking");
    }, 380);
  };

  shopkeeper.addEventListener("mouseenter", showHoverLine);
  shopkeeper.addEventListener("focus", showHoverLine);
  shopkeeper.addEventListener("mouseleave", restoreCurrentLine);
  shopkeeper.addEventListener("blur", restoreCurrentLine);
  shopkeeper.addEventListener("click", speakNextLine);
  shopkeeper.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    speakNextLine();
  });

  shopkeeper.append(shopkeeperCat, shopkeeperNote, shopkeeperLine);

  interior.append(copy, shopkeeper);
  card.append(signboard, interior);
  els.shopTabs.appendChild(card);
}

function renderIngredients() {
  els.ingredients.innerHTML = "";
  const { issue, availableIngredientIds } = getCurrentPlayContext();
  if (!issue) return;

  availableIngredientIds.forEach((ingredientId) => {
    const ingredient = getIngredientById(ingredientId);
    if (!ingredient) return;

    const selectedCount = state.selectedSlots.filter((id) => id === ingredientId).length;
    const button = document.createElement("button");
    button.className = "ingredient";
    button.type = "button";
    button.setAttribute("aria-label", ingredient.description ? `选择${ingredient.name}：${ingredient.description}` : `选择${ingredient.name}`);
    button.title = ingredient.description || ingredient.name;
    const name = document.createElement("span");
    name.className = "ingredient-name";
    name.textContent = ingredient.name;
    const desc = document.createElement("span");
    desc.className = "ingredient-desc";
    desc.textContent = ingredient.description;
    button.append(name, desc);
    if (selectedCount) {
      const count = document.createElement("span");
      count.className = "ingredient-count";
      count.textContent = `已选 x${selectedCount}`;
      button.appendChild(count);
    }
    if (selectedCount) {
      button.classList.add("selected");
    }
    button.addEventListener("click", () => selectIngredient(ingredientId));
    els.ingredients.appendChild(button);
  });
}

function enterIssuePlay(issue, seedIssue, shop) {
  setScreen("issue_play");
  const riddle = issue.riddle_text || seedIssue?.riddle_text || "猫大师今天只眯着眼，不肯把谜面说完整。";
  const shopName = shop?.name || seedIssue?.shop_name || issue.shop_name || "深夜小店";
  els.issueTitle.textContent = seedIssue?.title || getIssueDisplayTitle(issue);
  els.issueShopAnchor.textContent = `前往 ${shopName}，选择两味食材献祭。`;
  els.riddleBox.textContent = riddle;
  els.feedback.textContent = "";

  renderShopDisplay();
  renderIngredients();
  updateSacrificeSlots();
}

function startGame(issueId) {
  if (state.isShopEntering) return;

  const seedIssue = getSeedIssueById(issueId);
  const issue = getIssueById(issueId);
  if (!issue) return;
  const shop = getShopById(seedIssue?.shop_id || issue.shop_id);

  state.currentIssueId = issueId;
  state.currentSeedIssueId = seedIssue?.issue_id || null;
  state.selectedSlots = [null, null];
  state.isJudging = false;
  state.isShopEntering = true;
  hideJudgementOverlay(true);

  setScreen("shop_entry");
  showShopEntryTransition(shop);

  const transitionMs = prefersReducedMotion() ? 800 : 960;
  state.shopEntryTimer = window.setTimeout(() => {
    state.shopEntryTimer = null;
    state.isShopEntering = false;
    hideShopEntryTransition();
    enterIssuePlay(issue, seedIssue, shop);
  }, transitionMs);
}

function selectIngredient(ingredientId) {
  if (!state.currentIssueId || state.isJudging) return;
  playSfx("click");
  animateCat();

  const openSlotIndex = state.selectedSlots.findIndex((slot) => !slot);
  if (openSlotIndex === -1) {
    els.feedback.textContent = "两个献祭槽都满了，点槽位可以取回食材。";
    return;
  }

  state.selectedSlots[openSlotIndex] = ingredientId;
  els.feedback.textContent = "";
  updateSacrificeSlots();
  renderIngredients();
}

function clearSacrificeSlot(slotIndex) {
  if (state.isJudging) return;
  if (!state.selectedSlots[slotIndex]) return;
  playSfx("click");
  state.selectedSlots[slotIndex] = null;
  els.feedback.textContent = "";
  updateSacrificeSlots();
  renderIngredients();
}

function getHalfSuccessText(issue, matchedIngredientId) {
  const hint = getHintById(issue.half_success_hint_id);
  if (!hint) return "猫大师眯起眼：有一味对了，但话还没说完整。";
  if (hint.type === "shared") return hint.shared_hint || hint.matches[0]?.text || "有一味对了。";
  return hint.matches.find((match) => match.ingredient_id === matchedIngredientId)?.text || hint.matches[0]?.text || "有一味对了。";
}

function pickNonsenseSlip() {
  const slips = state.data.nonsense_slips;
  if (!slips.length) return "猫咪打了个哈欠，你什么也没得到。";
  const index = Math.floor(Math.random() * slips.length);
  return slips[index].text;
}

function showNonsenseSlipFailure() {
  showResult({
    type: "failure_slip",
    eyebrow: "猫咪废话签",
    title: "猫咪废话签",
    body: pickNonsenseSlip(),
    icon: "📜",
    actionLabel: "撕掉",
  });
}

function showMudPawFailure() {
  showPenaltyOverlay(
    "mud-paw",
    "泥巴猫爪印",
    "猫咪嫌弃你的食物，留下爪印跑了。",
  );
  renderPenaltyItems("mud-paw", "🐾", penaltyItemPositions["mud-paw"]);
}

function showCatHairFailure() {
  showPenaltyOverlay(
    "cat-hair",
    "猫毛过敏",
    "猫咪气得炸毛，漫天猫毛让你喷嚏连连！快挥挥手赶走它们～",
  );
  renderPenaltyItems("cat-hair", "〰", penaltyItemPositions["cat-hair"]);
  clearCatHairTimer();
  state.catHairTimer = window.setTimeout(finishFailurePenalty, 7000);
}

function showFailurePunishment() {
  const penaltyId = selectFailurePenalty();
  if (penaltyId === "mud-paw") {
    showMudPawFailure();
    return;
  }

  if (penaltyId === "cat-hair") {
    showCatHairFailure();
    return;
  }

  showNonsenseSlipFailure();
}

function getIngredientDisplayName(ingredientId) {
  return getIngredientById(ingredientId)?.name || "神秘食材";
}

function setJudgementIngredientNames(selectedIngredientIds) {
  const [leftIngredientId, rightIngredientId] = selectedIngredientIds || [];
  els.judgementIngredientLeft.textContent = getIngredientDisplayName(leftIngredientId);
  els.judgementIngredientRight.textContent = getIngredientDisplayName(rightIngredientId);
}

function showJudgementOverlay(selectedIngredientIds) {
  setJudgementIngredientNames(selectedIngredientIds);
  els.sacrificeCounter.classList.add("is-judging");
  els.judgementOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    els.judgementOverlay.classList.add("is-visible");
  });
}

function hideJudgementOverlay(immediate = false) {
  els.sacrificeCounter.classList.remove("is-judging");
  els.judgementOverlay.classList.remove("is-visible");
  if (immediate) {
    els.judgementOverlay.hidden = true;
    return;
  }

  window.setTimeout(() => {
    if (!els.judgementOverlay.classList.contains("is-visible")) {
      els.judgementOverlay.hidden = true;
    }
  }, 180);
}

function judgeSelection(issue, selectedIngredientIds) {
  const recipe = issue.recipe_ingredient_ids;
  if (recipeMatches(selectedIngredientIds, recipe)) {
    const wisdom = getWisdomById(issue.success_wisdom_id);
    showResult({
      type: "success",
      eyebrow: "猫大师端上一道夜宵",
      title: issue.food_name,
      body: wisdom ? wisdom.text : "猫大师点点头，但这份智慧还没写好。",
      icon: "🍜",
      actionLabel: "把智慧带走",
    });
    return;
  }

  const matchedCount = countMatchedIngredients(selectedIngredientIds, recipe);
  if (matchedCount === 1) {
    const matchedIngredientId = selectedIngredientIds.find((ingredientId) => recipe.includes(ingredientId));
    showResult({
      type: "half_success",
      eyebrow: "猫大师眯起眼",
      title: "差一点就对了",
      body: getHalfSuccessText(issue, matchedIngredientId),
      icon: "🍵",
      actionLabel: "我知道了",
    });
    return;
  }

  showFailurePunishment();
}

function submitSelection() {
  if (state.isJudging) return;

  const issue = getIssueById(state.currentIssueId);
  const selectedIngredientIds = filledSlotIds();
  if (!issue || selectedIngredientIds.length !== 2) {
    playSfx("click");
    els.feedback.textContent = "食材还不充足哦";
    return;
  }

  playSfx("sacrifice-bell");
  state.isJudging = true;
  els.feedback.textContent = "";
  updateSacrificeSlots();
  showJudgementOverlay(selectedIngredientIds);
  window.setTimeout(() => {
    if (state.isJudging) playSfx("judgement-smoke");
  }, 360);

  window.setTimeout(() => {
    state.isJudging = false;
    hideJudgementOverlay();
    updateSacrificeSlots();
    judgeSelection(issue, selectedIngredientIds);
  }, 1000);
}

function showResult(result) {
  if (result.type === "success") {
    playSfx("success");
  } else if (result.type === "failure_slip") {
    playSfx("failure-slip");
  }

  state.activeResultType = result.type;
  state.screen = "result";
  els.overlay.className = `result-overlay ${result.type}`;
  els.resultCard.className = `result-card ${result.type}`;
  els.resultEyebrow.textContent = result.eyebrow;
  els.overlay.style.display = "flex";
  els.foodResult.textContent = result.icon;
  els.foodName.textContent = result.title;
  els.wisdomText.textContent = result.body;
  els.collectionFeedback.textContent = "";
  els.resultActionBtn.textContent = result.actionLabel;
  els.resultActionBtn.disabled = false;
  state.isCollectingSuccess = false;
}

function closeRetryResult() {
  els.overlay.style.display = "none";
  state.activeResultType = null;
  state.screen = "issue_play";
  resetSelection("已清空托盘，可以重新选择两味食材。");
}

function closeSuccessResult() {
  els.overlay.style.display = "none";
  els.resultActionBtn.disabled = false;
  state.isCollectingSuccess = false;
  state.activeResultType = null;
  showSeedSelection();
}

async function collectSuccessAndClose() {
  if (state.isCollectingSuccess) return;
  state.isCollectingSuccess = true;
  els.resultActionBtn.disabled = true;

  try {
    const entry = buildCurrentCollectionEntry();
    if (entry) {
      const collectionResult = addToCollection(entry);
      if (collectionResult.duplicate) {
        els.collectionFeedback.textContent = "老味道，新感悟";
      } else if (!collectionResult.saved) {
        els.collectionFeedback.textContent = "账本先记在本局里";
      }
      await flySuccessCardToBook();
    }
  } catch (error) {
    debugSfxWarning("collection-success", error);
  }

  closeSuccessResult();
}

function handleResultAction() {
  if (state.activeResultType === "failure_slip") {
    playSfx("slip-tear");
  } else {
    playSfx("click");
  }

  if (state.activeResultType === "success") {
    collectSuccessAndClose();
    return;
  }

  closeRetryResult();
}

async function init() {
  try {
    setScreen("opening");
    state.data = await loadGameData();
    state.assetManifest = await loadAssetManifest();
    state.collection = loadCollection();
    preloadAudioAssets();
    renderIssueButtons();
    updateCollectionButton();
    updateSacrificeSlots();
    els.enterDoorBtn.disabled = false;
    els.openingStatus.textContent = "雨还在下，门已经虚掩。";
    els.enterDoorBtn.addEventListener("click", startIntro);
    els.catIntroScreen.addEventListener("click", continueIntro);
    els.expandedCardFlowBtn.addEventListener("click", showCategorySelection);
    els.cardFlowBackBtn.addEventListener("click", handleCardFlowBack);
    els.collectionBookButton.addEventListener("click", openCollectionBook);
    els.collectionBookClose.addEventListener("click", closeCollectionBook);
    els.collectionBookOverlay.addEventListener("click", (event) => {
      if (event.target === els.collectionBookOverlay) closeCollectionBook();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !els.collectionBookOverlay.hidden) {
        closeCollectionBook();
      }
    });
    els.sacrificeSlots.forEach((slot, index) => {
      slot.addEventListener("click", () => clearSacrificeSlot(index));
    });
    els.submitBtn.addEventListener("click", submitSelection);
    els.resultActionBtn.addEventListener("click", handleResultAction);
  } catch (error) {
    console.error(error);
    els.enterDoorBtn.disabled = true;
    els.openingStatus.textContent = "猫大师今天打烊了，CSV 编译数据没加载出来。";
    els.riddleBox.textContent = "猫大师今天打烊了，CSV 编译数据没加载出来。请先运行 node scripts/compile-csv-to-runtime.js。";
  }
}

init();
