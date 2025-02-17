async function waitForElement(selector, timeout = 3000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return null;
}

// create a badge to add to the page
const badge = document.createElement("p");
const readingTime = Math.round(200 / 200);
badge.classList.add("color-secondary-text", "type--caption");
badge.textContent = `⏱️ ${readingTime} min read`;

(async () => {
  const article = document.querySelector("article");
  if (!article) {
    console.log("article not found");
    return;
  }
  console.log("found article");
  const text = article.textContent;
  const wordMatchRegExp = /[^\s]+/g; // Regular expression
  const words = text.matchAll(wordMatchRegExp);
  // matchAll returns an iterator, convert to array to get word count
  const wordCount = [...words].length;
  const readingTime = Math.round(wordCount / 200);
  const badge = document.createElement("p");
  // Use the same styling as the publish information in an article's header
  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏱️ ${readingTime} min read`;

  // Support for API reference docs
  const heading = article.querySelector("h1");
  // Support for article docs with date
  const date = article.querySelector("time")?.parentNode;

  (date ?? heading).insertAdjacentElement("afterend", badge);
  console.log("inserted badge to date or heading");
})();

(async () => {
  const ytdApp = await waitForElement("ytd-app");
  if (!ytdApp) {
    console.log("ytd-app not found");
    return;
  }
  console.log("found ytd-app");

  const ytdPageManager = await waitForElement("ytd-page-manager", 3000);
  if (!ytdPageManager) {
    console.log("ytd-page-manager not found");
    return;
  }

  const ytdWatchFlexy = await waitForElement("ytd-watch-flexy", 3000);
  if (!ytdWatchFlexy) {
    console.log("ytd-watch-flexy not found");
    return;
  }

  const columnsDiv = await waitForElement("#columns", 3000);
  if (!columnsDiv) {
    console.log('Div with id="columns" not found');
    return;
  }

  console.log('Found the div with id="columns"');

  const primaryDiv = await waitForElement("#primary", 3000);
  if (!primaryDiv) {
    console.log('Div with id="primary" not found');
    return;
  }
  console.log('Found the div with id="primary"');

  const primaryInnerDiv = await waitForElement("#primary-inner", 3000);
  if (!primaryInnerDiv) {
    console.log('Div with id="primary-inner" not found');
    return;
  }
  console.log('Found the div with id="primary-inner"');

  const belowDiv = await waitForElement("#below", 3000);
  if (!belowDiv) {
    console.log('Div with id="below" not found');
    return;
  }
  console.log('Found the div with id="below"');

  const ytdComments = await waitForElement("ytd-comments", 3000);
  if (!ytdComments) {
    console.log("ytd-comments not found");
    return;
  }
  console.log("found ytd-comments");

  const itemSectionRenderer = await waitForElement(
    "ytd-item-section-renderer",
    3000
  );
  if (!itemSectionRenderer) {
    console.log("ytd-item-section-renderer not found");
    return;
  }

  const divCommentHeader = await waitForElement("#header", 3000);
  if (!divCommentHeader) {
    console.log("div id header not found");
    return;
  }

  console.log("found div id header");
  divCommentHeader.insertAdjacentElement("afterend", badge);
})();
