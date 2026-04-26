const state = {
  data: null,
  screen: "opening",
  introLineIndex: 0,
  currentIssueId: null,
  currentSeedIssueId: null,
  selectedSlots: [null, null],
  activeResultType: null,
  isJudging: false,
  assetManifest: null,
  audioAssets: new Map(),
  audioCache: new Map(),
  cardFlow: {
    selectedCategory: "",
    selectedSubcategory: "",
  },
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

const DEMO_CARD_FLOW = [
  {
    id: "work-study",
    title: "职场与学业",
    subtitle: "任务、绩效、创作、压力",
    symbol: "☕",
    directions: [
      {
        id: "deadline-performance",
        title: "Deadline / 绩效焦虑",
        hint: "事情一件压一件，脑袋像没关火的锅。",
        issues: [
          {
            title: "Deadline 任务过载",
            issueId: "Q01",
          },
        ],
      },
    ],
  },
  {
    id: "desire-comparison",
    title: "欲望与比较",
    subtitle: "嫉妒、同辈压力、得失感",
    symbol: "✦",
    directions: [
      {
        id: "envy-peer-pressure",
        title: "嫉妒 / 同辈压力",
        hint: "别人的光太亮，自己的胃有点酸。",
        issues: [
          {
            title: "此时此刻的嫉妒心",
            issueId: "Q10",
          },
        ],
      },
    ],
  },
  {
    id: "self-personality",
    title: "自我与性格",
    subtitle: "短板、自我怀疑、不完美",
    symbol: "◐",
    directions: [
      {
        id: "self-doubt",
        title: "自我怀疑",
        hint: "把不够好的地方，先放到猫爪边。",
        issues: [
          {
            title: "对性格短板的怀疑",
            issueId: "Q07",
          },
        ],
      },
    ],
  },
  {
    id: "night-loss-control",
    title: "夜晚与失控",
    subtitle: "熬夜、虚无、报复性自由",
    symbol: "☾",
    directions: [
      {
        id: "revenge-bedtime",
        title: "报复性熬夜",
        hint: "越困越清醒，像一盏不肯灭的灯。",
        issues: [
          {
            title: "报复性熬夜",
            issueId: "Q08",
          },
        ],
      },
    ],
  },
  {
    id: "low-turning-point",
    title: "低谷与转机",
    subtitle: "倒霉、低谷、想求一个转机",
    symbol: "◇",
    directions: [
      {
        id: "bad-luck-turnaround",
        title: "倒霉求转机",
        hint: "坏运气黏在鞋底，等一阵热气冲散。",
        issues: [
          {
            title: "倒霉透顶求转机",
            issueId: "Q35",
          },
        ],
      },
    ],
  },
];

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
  judgementOverlay: document.getElementById("judgement-overlay"),
  judgementIngredientLeft: document.getElementById("judgement-ingredient-left"),
  judgementIngredientRight: document.getElementById("judgement-ingredient-right"),
  overlay: document.getElementById("overlay"),
  resultCard: document.getElementById("result-card"),
  resultEyebrow: document.getElementById("result-eyebrow"),
  foodResult: document.getElementById("food-result"),
  foodName: document.getElementById("food-name"),
  wisdomText: document.getElementById("wisdom-text"),
  resultActionBtn: document.getElementById("result-action-btn"),
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

function getDemoCategory(categoryId) {
  return DEMO_CARD_FLOW.find((category) => category.id === categoryId) || null;
}

function getDemoSubcategory(categoryId, subcategoryId) {
  const category = getDemoCategory(categoryId);
  return category?.directions.find((direction) => direction.id === subcategoryId) || null;
}

function renderCategorySelection() {
  setScreen("category_selection");
  els.cardFlowBackBtn.textContent = "返回五张默认卡";
  els.cardFlowTitle.textContent = "选择一种心绪方向";
  els.cardFlowSubtitle.textContent = "临时 V3 demo 卡牌流，只使用五个默认心结。";
  clearCardFlowGrid();

  DEMO_CARD_FLOW.forEach((category) => {
    const card = createCardFlowButton(
      "emotion-category-card",
      category.title,
      category.subtitle,
      (card) => selectCardThen(card, () => transitionCardFlow(() => renderSubcategorySelection(category.id))),
      { symbol: category.symbol },
    );
    els.cardFlowGrid.appendChild(card);
  });

  appendCardFlowNote("这是临时演示分层，不代表最终 40 题正式分类。");
}

function showCategorySelection() {
  playSfx("click");
  state.cardFlow.selectedCategory = "";
  state.cardFlow.selectedSubcategory = "";
  transitionCardFlow(renderCategorySelection);
}

function renderSubcategorySelection(categoryId) {
  const category = getDemoCategory(categoryId);
  if (!category) {
    renderCategorySelection();
    return;
  }

  state.cardFlow.selectedCategory = categoryId;
  state.cardFlow.selectedSubcategory = "";
  setScreen("subcategory_selection");
  els.cardFlowBackBtn.textContent = "返回分类";
  els.cardFlowTitle.textContent = category.title;
  els.cardFlowSubtitle.textContent = category.subtitle;
  clearCardFlowGrid();

  category.directions.forEach((direction) => {
    const card = createCardFlowButton(
      "emotion-subcategory-card",
      direction.title,
      direction.hint || "再让猫大师缩小一点范围。",
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
  const seedIssue = getSeedIssueById(issue.id);
  if (issue.title) return issue.title;
  if (seedIssue?.title) return seedIssue.title;
  return "未命名心绪（临时整理中）";
}

function renderIssueSelection(categoryId, subcategoryId) {
  const category = getDemoCategory(categoryId);
  const direction = getDemoSubcategory(categoryId, subcategoryId);
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

  direction.issues.forEach((issue) => {
    const card = createCardFlowButton(
      "emotion-issue-card",
      issue.title,
      "让猫大师闻闻这件事",
      (card) => selectIssueCard(card, issue.issueId),
    );
    card.dataset.issueId = issue.issueId;
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
  shopkeeper.setAttribute("aria-label", `${shop.npc || "店员猫"}占位符`);
  const shopkeeperCat = document.createElement("div");
  shopkeeperCat.className = "shopkeeper-cat";
  shopkeeperCat.setAttribute("aria-hidden", "true");
  shopkeeperCat.textContent = "🐱";
  const shopkeeperNote = document.createElement("div");
  shopkeeperNote.className = "shopkeeper-note";
  shopkeeperNote.textContent = "店员猫暂时用占位符，未来替换为素材";
  const shopkeeperDesc = document.createElement("div");
  shopkeeperDesc.className = "shopkeeper-desc";
  shopkeeperDesc.textContent = shop.npc_description || "正在柜台后面眯眼值班。";
  shopkeeper.append(shopkeeperCat, shopkeeperNote, shopkeeperDesc);

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

function startGame(issueId) {
  const seedIssue = getSeedIssueById(issueId);
  const issue = getIssueById(issueId);
  if (!issue) return;

  state.currentIssueId = issueId;
  state.currentSeedIssueId = seedIssue?.issue_id || null;
  state.selectedSlots = [null, null];
  state.isJudging = false;
  hideJudgementOverlay(true);

  setScreen("issue_play");
  const riddle = issue.riddle_text || seedIssue?.riddle_text || "猫大师今天只眯着眼，不肯把谜面说完整。";
  const shop = getShopById(seedIssue?.shop_id || issue.shop_id);
  const shopName = shop?.name || seedIssue?.shop_name || issue.shop_name || "深夜小店";
  els.issueTitle.textContent = seedIssue?.title || getIssueDisplayTitle(issue);
  els.issueShopAnchor.textContent = `前往 ${shopName}，选择两味食材献祭。`;
  els.riddleBox.textContent = riddle;
  els.feedback.textContent = "";

  renderShopDisplay();
  renderIngredients();
  updateSacrificeSlots();
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

  showResult({
    type: "failure_slip",
    eyebrow: "猫咪废话签",
    title: "猫咪废话签",
    body: pickNonsenseSlip(),
    icon: "📜",
    actionLabel: "撕掉",
  });
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
  els.resultActionBtn.textContent = result.actionLabel;
}

function closeRetryResult() {
  els.overlay.style.display = "none";
  state.activeResultType = null;
  state.screen = "issue_play";
  resetSelection("已清空托盘，可以重新选择两味食材。");
}

function closeSuccessResult() {
  state.activeResultType = null;
  showSeedSelection();
}

function handleResultAction() {
  if (state.activeResultType === "failure_slip") {
    playSfx("slip-tear");
  } else {
    playSfx("click");
  }

  if (state.activeResultType === "success") {
    closeSuccessResult();
    return;
  }

  closeRetryResult();
}

async function init() {
  try {
    setScreen("opening");
    state.data = await loadGameData();
    state.assetManifest = await loadAssetManifest();
    preloadAudioAssets();
    renderIssueButtons();
    updateSacrificeSlots();
    els.enterDoorBtn.disabled = false;
    els.openingStatus.textContent = "雨还在下，门已经虚掩。";
    els.enterDoorBtn.addEventListener("click", startIntro);
    els.catIntroScreen.addEventListener("click", continueIntro);
    els.expandedCardFlowBtn.addEventListener("click", showCategorySelection);
    els.cardFlowBackBtn.addEventListener("click", handleCardFlowBack);
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
