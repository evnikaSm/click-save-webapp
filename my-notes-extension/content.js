// находится в контексте веб страницы
console.log("My Notes extension loaded");
function getPageData() {
    const selectedText =
        window.getSelection()
            .toString()
            .trim();
    return {
        text: selectedText,
        url: window.location.href,
        pageTitle: document.title
    };
}
chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.action === "getPageData") {
            const pageData =
                getPageData();
            console.log(
                "My Notes page data:",
                pageData
            );
            sendResponse(pageData);
        }
    }
);