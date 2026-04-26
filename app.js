const state = {
  data: null,
  screen: "opening",
  introLineIndex: 0,
  currentIssueId: null,
  currentSeedIssueId: null,
  selectedSlots: [null, null],
  activeResultType: null,
  isJudging: false,
};

const introLines = [
  "（哈欠）...又是这个点，又是这种味道。",
  "说吧，今晚是什么东西让你这只两脚兽消化不良？",
];

const els = {
  openingScreen: document.getElementById("opening-screen"),
  enterDoorBtn: document.getElementById("enter-door-btn"),
  openingStatus: document.getElementById("opening-status"),
  catIntroScreen: document.getElementById("cat-intro-screen"),
  introDialogue: document.getElementById("intro-dialogue"),
  introContinueBtn: document.getElementById("intro-continue-btn"),
  startScreen: document.getElementById("start-screen"),
  issueButtons: document.getElementById("issue-buttons"),
  issuePlayScreen: document.getElementById("issue-play-screen"),
  issueTitle: document.getElementById("issue-play-title"),
  issueShopAnchor: document.getElementById("issue-shop-anchor"),
  catMaster: document.getElementById("cat-master"),
  riddleBox: document.getElementById("riddle-box"),
  shopUi: document.getElementById("shop-ui"),
  shopTabs: document.getElementById("shop-tabs"),
  ingredients: document.getElementById("ingredients"),
  sacrificeSlots: [
    document.getElementById("sacrifice-slot-0"),
    document.getElementById("sacrifice-slot-1"),
  ],
  submitBtn: document.getElementById("submit-btn"),
  feedback: document.getElementById("feedback"),
  judgementOverlay: document.getElementById("judgement-overlay"),
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
  state.screen = screen;
  els.openingScreen.hidden = screen !== "opening";
  els.catIntroScreen.hidden = screen !== "cat_intro";
  els.startScreen.style.display = screen === "seed_selection" ? "flex" : "none";
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
    slot.setAttribute("aria-label", ingredient ? `移除 ${ingredient.name}` : `献祭槽 ${index + 1}，等待食材`);
  });

  els.submitBtn.classList.toggle("ready", filledCount === 2);
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

function startIntro() {
  state.introLineIndex = 0;
  els.introDialogue.textContent = introLines[state.introLineIndex];
  els.introContinueBtn.textContent = "继续";
  setScreen("cat_intro");
}

function continueIntro() {
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
  if (!seedIssue || !issue) return;

  state.currentIssueId = issueId;
  state.currentSeedIssueId = seedIssue.issue_id;
  state.selectedSlots = [null, null];
  state.isJudging = false;
  hideJudgementOverlay(true);

  setScreen("issue_play");
  const riddle = issue.riddle_text || seedIssue.riddle_text || "猫大师今天只眯着眼，不肯把谜面说完整。";
  const shop = getShopById(seedIssue.shop_id || issue.shop_id);
  const shopName = shop?.name || seedIssue.shop_name || "深夜小店";
  els.issueTitle.textContent = seedIssue.title;
  els.issueShopAnchor.textContent = `前往 ${shopName}，选择两味食材献祭。`;
  els.riddleBox.textContent = riddle;
  els.feedback.textContent = "";

  renderShopDisplay();
  renderIngredients();
  updateSacrificeSlots();
}

function selectIngredient(ingredientId) {
  if (!state.currentIssueId || state.isJudging) return;
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

function showJudgementOverlay() {
  els.judgementOverlay.hidden = false;
  window.requestAnimationFrame(() => {
    els.judgementOverlay.classList.add("is-visible");
  });
}

function hideJudgementOverlay(immediate = false) {
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
    els.feedback.textContent = "食材还不充足哦";
    return;
  }

  state.isJudging = true;
  els.feedback.textContent = "";
  updateSacrificeSlots();
  showJudgementOverlay();

  window.setTimeout(() => {
    state.isJudging = false;
    hideJudgementOverlay();
    updateSacrificeSlots();
    judgeSelection(issue, selectedIngredientIds);
  }, 1000);
}

function showResult(result) {
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
    renderIssueButtons();
    updateSacrificeSlots();
    els.enterDoorBtn.disabled = false;
    els.openingStatus.textContent = "雨还在下，门已经虚掩。";
    els.enterDoorBtn.addEventListener("click", startIntro);
    els.catIntroScreen.addEventListener("click", continueIntro);
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
