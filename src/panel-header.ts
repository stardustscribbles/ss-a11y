const automationHeaderEle = document.querySelector(".automation-test-tab-header");
const assistedHeaderEle = document.querySelector(".assisted-test-tab-header");
const recorderHeaderEle = document.querySelector(".recorder-test-tab-header");

const automationTabContent = document.querySelector(".automation-test-tab-container");
const assistedTabContent = document.querySelector(".assisted-test-tab-container");
const recorderTabContent = document.querySelector(".recorder-test-tab-container");

automationHeaderEle?.addEventListener("click", () => {
    automationHeaderEle?.classList.add("selected");
    assistedHeaderEle?.classList.remove("selected");
    recorderHeaderEle?.classList.remove("selected");

    automationTabContent?.classList.add("tab-content-visible");
    assistedTabContent?.classList.remove("tab-content-visible");
    recorderTabContent?.classList.remove("tab-content-visible");
});
assistedHeaderEle?.addEventListener("click", () => {
    automationHeaderEle?.classList.remove("selected");
    assistedHeaderEle?.classList.add("selected");
    recorderHeaderEle?.classList.remove("selected");

    automationTabContent?.classList.remove("tab-content-visible");
    assistedTabContent?.classList.add("tab-content-visible");
    recorderTabContent?.classList.remove("tab-content-visible");
});
recorderHeaderEle?.addEventListener("click", () => {
    automationHeaderEle?.classList.remove("selected");
    assistedHeaderEle?.classList.remove("selected");
    recorderHeaderEle?.classList.add("selected");

    automationTabContent?.classList.remove("tab-content-visible");
    assistedTabContent?.classList.remove("tab-content-visible");
    recorderTabContent?.classList.add("tab-content-visible");
});
