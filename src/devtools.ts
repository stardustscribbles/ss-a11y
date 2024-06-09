import { A11yTest, FlowStep, TestUrl } from "./types";

let youClickedOn: Element | null;

// let steps: FlowStep[] = [];
let stepCounter = 0;
let testCounter = 0;

let _panelWindow: any;
let recordingState: "notStarted" | "inProgress" | "paused" | "stopped" = "notStarted";

let testFlow: (FlowStep | A11yTest | TestUrl)[] = [];

const supportedEventTypes = ["click"];

const raiseAlert = (message: string) => {
    chrome.devtools.inspectedWindow.eval(`alert("Message: ${message}");`);
};

const addOnShownListener = (panel: any) => {
    panel.onShown.addListener((extPanelWindow: any) => {
        _panelWindow = extPanelWindow;
        let sayHello: Element | null = extPanelWindow.document.querySelector("#sayHello");
        youClickedOn = extPanelWindow.document.querySelector("#youClickedOn");
        sayHello?.addEventListener("click", () => {
            // show a greeting alert in the inspected page
            chrome.devtools.inspectedWindow.eval('alert("Hello from the DevTools extension");');
        });

        chrome.devtools.inspectedWindow.eval("window.location.href", (result, isException) => {
            if (!isException) {
                _panelWindow.addUrl(result);
                testFlow.push(<TestUrl>{
                    url: result,
                    type: "URL",
                });
            } else {
                console.error("Error getting the URL of the inspected tab");
            }
        });

        const startRecordingButton = extPanelWindow.document.querySelector("#start-recording-button");
        const saveFlowButton = extPanelWindow.document.querySelector("#save-flow-button");
        const addA11yTestButton = extPanelWindow.document.querySelector("#add-a11y-test-button");
        const testNameInput: HTMLInputElement = extPanelWindow.document.querySelector("#test-name-input");

        startRecordingButton?.addEventListener("click", () => {
            if (recordingState === "inProgress") {
                recordingState = "paused";
                startRecordingButton.innerText = "Start recording";
            } else {
                recordingState = "inProgress";
                startRecordingButton.innerText = "Pause recording";
            }
        });
        saveFlowButton?.addEventListener("click", () => {
            recordingState = "stopped";
            let message = "";
            (testFlow || []).forEach((f) => {
                message += `\\n`;
                if (f.type === "ACTION") {
                    message += `\\nACTION: ${(f as FlowStep).action} ${(f as FlowStep).value}`;
                } else if (f.type === "TEST") {
                    message += `\\nTEST: ${(f as A11yTest).name}`;
                } else if (f.type === "URL") {
                    message += `\\nURL: ${(f as TestUrl).url}`;
                }
            });
            raiseAlert(`${message}`);
        });
        addA11yTestButton?.addEventListener("click", () => {
            if (testNameInput.value) {
                testCounter = testCounter + 1;
                const test = <A11yTest>{
                    id: `${testCounter}`,
                    name: testNameInput.value,
                    type: "TEST",
                };
                testFlow.push(test);
                _panelWindow.addTest(test);
            }
        });
        _panelWindow.addEventListener("update-step", (event: CustomEvent) => {
            const index = testFlow.findIndex((value: any) => value.type === "ACTION" && value?.id === event?.detail?.stepDetails?.id);
            if (index !== -1) {
                const keyToUpdate = event?.detail?.key;
                if (keyToUpdate) {
                    (testFlow[index] as any)[keyToUpdate] = event?.detail?.value;
                    _panelWindow.updateStep(testFlow[index], keyToUpdate);
                }
            }
        });

        _panelWindow.addEventListener("update-test", (event: CustomEvent) => {
            const index = testFlow.findIndex((value: any) => value.type === "TEST" && value?.id === event?.detail?.id);
            if (index !== -1) {
                (testFlow[index] as A11yTest).name = event?.detail?.name;
                _panelWindow.updateTest(testFlow[index]);
            }
        });
        _panelWindow.addEventListener("delete-test", (event: CustomEvent) => {
            const index = testFlow.findIndex((value: any) => value.type === "TEST" && value?.id === event?.detail?.id);
            if (index !== -1) {
                _panelWindow.deleteTest(testFlow[index]);
                testFlow.splice(index, 1);
            }
        });
        _panelWindow.addEventListener("delete-step", (event: CustomEvent) => {
            const index = testFlow.findIndex((value: any) => value.type === "ACTION" && value?.id === event?.detail?.stepDetails?.id);
            if (index !== -1) {
                _panelWindow.deleteStep(testFlow[index]);
                testFlow.splice(index, 1);
            }
        });
    });
};

const addOnMessageListener = (request: FlowStep | any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (recordingState === "inProgress") {
        if ((sender.tab && request.action === "click") || request.action === "keydown" || request.action === "keyup" || request.action === "change") {
            if (_panelWindow["stepToUpdate"]) {
                const id = _panelWindow["stepToUpdate"];
                _panelWindow["stepToUpdate"] = undefined;
                const index2 = testFlow.findIndex((value: any) => value?.id === id);
                if (index2 !== -1) {
                    (testFlow[index2] as FlowStep).selectors = request.selectors;
                    _panelWindow.updateStep(testFlow[index2], "selectors");
                }
            } else {
                let addNewStep = true;
                if (request.action === "change") {
                    let lastStep = testFlow[testFlow.length - 1];
                    if (lastStep.type === "ACTION") {
                        const selector1 = (lastStep as FlowStep).selectors.map((s) => s.value).join(";");
                        const selector2 = (request as FlowStep).selectors.map((s) => s.value).join(";");

                        if ((lastStep as FlowStep).action === "keydown" && selector1 === selector2) {
                            _panelWindow.deleteStep(lastStep);
                            testFlow.splice(testFlow.length - 1, 1);
                            lastStep = testFlow[testFlow.length - 1];
                        }
                        if ((lastStep as FlowStep).action === "change" && selector1 === selector2) {
                            (lastStep as FlowStep).value = request.value;
                            addNewStep = false;
                            _panelWindow.updateStep(lastStep, "value");
                        }
                    }
                }
                if (addNewStep) {
                    stepCounter = stepCounter + 1;
                    const step: FlowStep = {
                        id: `${stepCounter}`,
                        action: request.action,
                        type: "ACTION",
                        selectors: request.selectors,
                        xpath: request.xpath,
                        xPosition: request.xPosition,
                        yPosition: request.yPosition,
                        value: request.value,
                        keyboardKey: request.keyboardKey,
                    };

                    testFlow.push(step);
                    _panelWindow.addStep(step);
                }
            }
        }
    }
    sendResponse({
        recordingState: recordingState,
        request: request,
        data: _panelWindow["stepToUpdate"],
    });
};

chrome.devtools.panels.create("Sample Panel", "icon.png", "panel.html", addOnShownListener);

chrome.runtime.onMessage.addListener(addOnMessageListener);

const backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page",
});

// Relay the tab ID to the background service worker
backgroundPageConnection.postMessage({
    name: "init",
    tabId: chrome.devtools.inspectedWindow.tabId,
});

// backgroundPageConnection.onMessage.addListener(function (msg) {
//     // Write information to the panel, if exists.
//     // If we don't have a panel reference (yet), queue the data.
//     if (_window) {
//         _window.do_something(msg);
//     } else {
//         data.push(msg);
//     }
// });
