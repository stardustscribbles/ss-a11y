import { FlowStepRequest, Selector } from "./types";

let selectorMode = false;

chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log(request);
});

const isElementEditable = (element: any) => {
    if (element?.tagName?.toLowerCase() === "input" || element?.tagName?.toLowerCase() === "textarea") {
        return true;
    } else if (element?.getAttribute("contenteditable") === "true") {
        return true;
    }
    return false;
};

let keydownElementValue: any;
let pendingEventsToSend: any[] = [];

const getActiveElement = (element: any): any => {
    if (element.shadowRoot && element.shadowRoot.activeElement) {
        return getActiveElement(element.shadowRoot.activeElement);
    } else {
        return element;
    }
};

let keydownPending: boolean = false;
let pendingKeyupMessages: { [keycode: string]: any } = {};

const addKeydownEvent = () => {
    document.addEventListener(
        "keydown",
        (event: KeyboardEvent) => {
            // console.log("keydown activeElement", getActiveElement(document.activeElement));
            if (isElementEditable(event.composedPath()[0])) {
                keydownElementValue = (event.composedPath()[0] as any)?.value || (event.composedPath()[0] as any)?.textContent;
            }
            pendingKeyupMessages[event.code] = <FlowStepRequest>{
                action: "keydown",
                selectors: getElementSelecor3(event.composedPath()[0]),
                xpath: getElementXPath(event.composedPath()[0]),
                keyboardKey: event.code,
            };
        },
        true
    );
};

const addKeyupEvent = () => {
    document.addEventListener(
        "keyup",
        (event: KeyboardEvent) => {
            const sendUpEvent = () => {
                if (pendingKeyupMessages[event.code]) {
                    chrome.runtime.sendMessage(pendingKeyupMessages[event.code]);
                    delete pendingKeyupMessages[event.code];
                }
                chrome.runtime.sendMessage(<FlowStepRequest>{
                    action: "keyup",
                    selectors: getElementSelecor3(event.composedPath()[0]),
                    xpath: getElementXPath(event.composedPath()[0]),
                    keyboardKey: event.code,
                });
                keydownElementValue = undefined;
            };
            if (isElementEditable(event.composedPath()[0])) {
                let keydownElementValueNew = (event.composedPath()[0] as any)?.value || (event.composedPath()[0] as any)?.textContent;
                if (keydownElementValue !== keydownElementValueNew) {
                    chrome.runtime.sendMessage(<FlowStepRequest>{
                        action: "change",
                        selectors: getElementSelecor3(event.composedPath()[0]),
                        xpath: getElementXPath(event.composedPath()[0]),
                        value: keydownElementValueNew,
                    });
                } else {
                    sendUpEvent();
                }
            } else {
                sendUpEvent();
            }
            keydownPending = false;
        },
        true
    );
};

document.addEventListener(
    "click",
    (event) => {
        // console.log(event, (event.target as any).value);
        chrome.runtime.sendMessage(
            <FlowStepRequest>{
                action: "click",
                xPosition: event.clientX + document.body.scrollLeft,
                yPosition: event.clientY + document.body.scrollTop,
                selectors: getElementSelecor3(event.composedPath()[0]),
                xpath: getElementXPath(event.composedPath()[0]),
            },
            (response) => {
                // console.log("Received response", response);
            }
        );
    },
    true
);

addKeydownEvent();
addKeyupEvent();

function getElementSelecor3(element: any) {
    let elementSelectors: Selector[] = [];
    const selector = getElementSelectorSelfAndSibling(element, elementSelectors);
    let finalSelector = "";
    elementSelectors.reverse().forEach((selectorObj: any) => {
        if (selectorObj.shadowRoot) {
            finalSelector += `.shadowRoot.querySelector("${selectorObj.selector}")`;
        } else {
            finalSelector += `document.querySelector("${selectorObj.selector}")`;
        }
    });
    return elementSelectors;
}

function getElementSelectorSelfAndSibling(element: any, elementSelectors: Selector[]): any {
    if (!element) {
        return "";
    }
    let selector = getElementSelectorSelf(element);
    let siblingIndex = getElementSelecorSibling(element);
    if (siblingIndex > 1) {
        selector = `${selector}:nth-of-type(${siblingIndex})`;
    }
    if (element.parentNode) {
        while (element.parentNode.nodeType === Node.ELEMENT_NODE) {
            let parentSelector = getElementSelectorSelf(element.parentElement);
            parentSelector = parentSelector ? `${parentSelector} > ` : "";
            selector = `${parentSelector}${selector}`;
            element = element.parentElement;
        }
        elementSelectors.push({
            shadowRoot: element.parentNode?.nodeType === Node.DOCUMENT_FRAGMENT_NODE,
            value: selector,
        });
        if (element.parentNode?.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            element = element.parentNode.host;
            return `${selector}-----` + getElementSelectorSelfAndSibling(element, elementSelectors);
        } else {
            return selector;
        }
    }
    elementSelectors.push({
        shadowRoot: false,
        value: selector,
    });
    return selector;
}

function getElementSelectorSelf(element: any) {
    let selector = element.tagName.toLowerCase();

    if (element.id) {
        return `${selector}#${element.id}`;
    }

    if (element.className) {
        selector += "." + element.className.trim().split(/\s+/).join(".");
    }
    return selector;
}

function getElementSelecorSibling(element: any) {
    let count = 0;

    let siblings: any = element.parentElement && element.parentElement.nodeType === Node.ELEMENT_NODE ? Array.from(element.parentElement.children) : [];
    for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].tagName === element.tagName) {
            count++;
        }
        if (siblings[i] === element) {
            return count;
        }
    }
    return 1;
}

function getElementXPath(element: any) {
    if (element.id) {
        return `//*[@id="${element.id}"]`;
    }

    let parts = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let siblings = Array.from(element.parentNode.children).filter((sibling: any) => sibling.tagName === element.tagName);
        let index = siblings.indexOf(element) + 1;
        let part = element.tagName.toLowerCase();
        if (siblings.length > 1) {
            part += `[${index}]`;
        }
        parts.unshift(part);
        element = element.parentNode;
    }

    return parts.length ? "/" + parts.join("/") : null;
}
