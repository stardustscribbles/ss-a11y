import { A11yTest, FlowStep, Selector } from "./types";

const addStep = (step: FlowStep) => {
    const stepsDivElement: HTMLDivElement | null = document.querySelector("#flow-steps");
    if (stepsDivElement) {
        stepsDivElement!.style.display = "none";
        stepsDivElement.classList.remove("steps-container");
        stepsDivElement.classList.add("steps-container");

        const stepDiv = getStepNode(step);
        stepDiv.style.position = "relative";
        const deleteIcon = getDeleteIconSvgIcon();
        stepDiv.appendChild(getTopRightIcon(deleteIcon));
        deleteIcon.addEventListener("click", (e: Event) => {
            e.stopPropagation();
            e.preventDefault();
            dispatchEvent(
                new CustomEvent("delete-step", {
                    detail: {
                        stepDetails: step,
                    },
                })
            );
        });

        stepsDivElement.appendChild(stepDiv);

        stepsDivElement!.style.display = "flex";
    }
};

const updateStep = (step: FlowStep, keyToUpdate: string) => {
    const stepsDivElement: HTMLDivElement | null = document.querySelector("#flow-steps");
    if (stepsDivElement) {
        // stepsDivElement!.style.display = "none";
        stepsDivElement.classList.remove("steps-container");
        stepsDivElement.classList.add("steps-container");

        if (keyToUpdate === "selectors") {
            const oldStepSelectorsElements = stepsDivElement.querySelector(`div[data-step-id="${step.id}"] > .selectors-container`);
            if (oldStepSelectorsElements) {
                oldStepSelectorsElements!.innerHTML = "";

                if (step.selectors) {
                    oldStepSelectorsElements!.appendChild(getStepSelectorNode(step));
                }
            }
        } else if (keyToUpdate === "value" || keyToUpdate === "action") {
            const inputValueElement = stepsDivElement.querySelector(`div[data-step-id="${step.id}"] div[data-key="${keyToUpdate}"]`);
            if (inputValueElement) {
                (inputValueElement as any).innerText = step.value;
            }
        }
    }
};

const updateStepValue = (step: FlowStep) => {
    const stepsDivElement: HTMLDivElement | null = document.querySelector("#flow-steps");
    if (stepsDivElement) {
        // stepsDivElement!.style.display = "none";
        stepsDivElement.classList.remove("steps-container");
        stepsDivElement.classList.add("steps-container");

        const inputValueElement = stepsDivElement.querySelector(`div[data-step-id="${step.id}"] div[data-key="value"]`);
        if (inputValueElement) {
            (inputValueElement as any).innerText = step.value;
        }
    }
};

const deleteStep = (step: FlowStep) => {
    const stepsDivElement: HTMLDivElement | null = document.querySelector("#flow-steps");
    if (stepsDivElement) {
        // stepsDivElement!.style.display = "none";
        stepsDivElement.classList.remove("steps-container");
        stepsDivElement.classList.add("steps-container");

        const stepElement = stepsDivElement.querySelector(`div[data-step-id="${step.id}"]`);
        if (stepElement) {
            stepElement.remove();
        }
    }
};

const addTest = (test: A11yTest) => {
    const stepsDivElement: HTMLDivElement | null = document.querySelector("#flow-steps");
    if (stepsDivElement) {
        stepsDivElement.classList.remove("steps-container");
        stepsDivElement.classList.add("steps-container");

        const div: HTMLElement = document.createElement("div");
        div.classList.add("step-test-container", "test-name-container");

        div.setAttribute("data-test-id", `${test.id}`);

        const nameDiv = document.createElement("div");
        nameDiv.innerText = test.name;
        nameDiv.setAttribute("data-ph", "Enter test name");
        nameDiv.setAttribute("contenteditable", "true");

        div.appendChild(nameDiv);

        const deleteIcon = getDeleteIconSvgIcon();
        div.style.position = "relative";
        div.appendChild(deleteIcon);

        // div.appendChild(getTopRightIcon(deleteIcon));

        deleteIcon.addEventListener("click", (e: Event) => {
            e.stopPropagation();
            e.preventDefault();
            dispatchEvent(
                new CustomEvent("delete-test", {
                    detail: {
                        id: test.id,
                    },
                })
            );
        });

        const preValue = div.textContent;

        div.addEventListener("focusout", () => {
            if (preValue !== div.textContent) {
                dispatchEvent(
                    new CustomEvent("update-test", {
                        detail: {
                            id: test.id,
                            name: div.textContent,
                        },
                    })
                );
            }
        });

        stepsDivElement.appendChild(div);
    }
};

const updateTest = (test: A11yTest) => {
    const stepsDivElement: HTMLDivElement | null = document.querySelector("#flow-steps");
    if (stepsDivElement) {
        stepsDivElement.classList.remove("steps-container");
        stepsDivElement.classList.add("steps-container");

        const testElement: HTMLDivElement | null = stepsDivElement.querySelector(`div[data-test-id="${test.id}"] div[contenteditable]`);
        if (testElement) {
            testElement!.innerText = test.name;
        }
    }
};

const deleteTest = (test: A11yTest) => {
    const stepsDivElement: HTMLDivElement | null = document.querySelector("#flow-steps");
    if (stepsDivElement) {
        stepsDivElement.classList.remove("steps-container");
        stepsDivElement.classList.add("steps-container");

        const testElement: HTMLDivElement | null = stepsDivElement.querySelector(`div[data-test-id="${test.id}"]`);
        if (testElement) {
            testElement.remove();
        }
    }
};

const addSteps = (steps: FlowStep[]) => {
    const stepsDivElement: HTMLDivElement | null = document.querySelector("#flow-steps");
    if (stepsDivElement) {
        stepsDivElement!.style.display = "none";
        stepsDivElement.innerHTML = "";
        stepsDivElement.innerText = "";
        stepsDivElement.classList.remove("steps-container");
        stepsDivElement.classList.add("steps-container");

        (steps || []).forEach((stepObj) => {
            const stepDiv = document.createElement("div");
            stepDiv.innerText = stepObj.selectors?.map((s) => s.value).join(";;;;");
            stepsDivElement.appendChild(getStepNode(stepObj));
        });

        stepsDivElement!.style.display = "flex";
    }
};

const getStepNode = (step: FlowStep): HTMLDivElement => {
    const div: HTMLDivElement = document.createElement("div");
    div.classList.add("step-test-container");
    div.setAttribute("data-step-id", `${step.id}`);
    if (step.action) {
        div.appendChild(getStepElementDivNode(step, "action", step.action, true));
    }
    if (step.selectors) {
        div.appendChild(getStepSelectorNode(step));
    }
    if (step.xPosition) {
        div.appendChild(getStepElementDivNode(step, "xPosition", step.xPosition));
    }
    if (step.yPosition) {
        div.appendChild(getStepElementDivNode(step, "yPosition", step.yPosition));
    }
    if (step.value) {
        div.appendChild(getStepElementDivNode(step, "value", step.value, true));
    }
    if (step.keyboardKey) {
        div.appendChild(getStepElementDivNode(step, "keyboardKey", step.keyboardKey));
    }

    if (step.id) {
        div.appendChild(getStepElementDivNode(step, "id", step.id));
    }

    return div;
};

const getStepElementDivNode = (step: FlowStep, key: string, value: any, editable?: boolean): HTMLDivElement => {
    const div: HTMLDivElement = document.createElement("div");
    div.classList.add("step-element-container");

    const keyDiv = document.createElement("div");
    keyDiv.innerText = `${key}: `;
    keyDiv.classList.add("step-element-key");

    const valueDiv = document.createElement("div");
    valueDiv.classList.add("step-element-value");
    valueDiv.innerText = value;
    valueDiv.setAttribute("data-key", key);
    if (editable) {
        valueDiv.setAttribute("contenteditable", "true");
        const preValue = valueDiv.textContent;
        valueDiv.addEventListener("focusout", () => {
            const newValue = valueDiv.textContent;
            if (preValue !== newValue) {
                dispatchEvent(
                    new CustomEvent("update-step", {
                        detail: {
                            stepDetails: step,
                            key: key,
                            value: newValue,
                        },
                    })
                );
            }
        });
    }

    div.appendChild(keyDiv);
    div.appendChild(valueDiv);

    return div;
};

const getStepSelectorNode = (step: FlowStep): HTMLDivElement => {
    const selectors: Selector[] = step.selectors;
    const div: HTMLDivElement = document.createElement("div");
    div.classList.add("selectors-container");

    const getSelectorNode = (index: number, selector: string): HTMLDivElement => {
        const selectorNode = document.createElement("div");
        selectorNode.classList.add("selector-container");

        const selectorHeader = document.createElement("div");
        selectorHeader.classList.add("selector-header");
        selectorHeader.innerText = `selector #${index}:`;

        const selectorValue = document.createElement("div");
        selectorValue.classList.add("selector-value");
        selectorValue.setAttribute("contenteditable", "true");
        selectorValue.innerText = selector;

        selectorNode.appendChild(selectorHeader);
        selectorNode.appendChild(selectorValue);

        return selectorNode;
    };

    const selectorsDivHeader = document.createElement("div");
    selectorsDivHeader.classList.add("selectors-header");
    selectorsDivHeader.innerText = `selectors: `;
    const elementSelectorIcon = getElementSelectorIcon();
    const elementSelector = document.createElement("span");
    elementSelector.innerHTML = elementSelectorIcon;

    selectorsDivHeader.innerText = `selectors: `;
    selectorsDivHeader.appendChild(elementSelector);

    elementSelector.classList.add("element-selector");
    elementSelector.addEventListener("click", () => {
        (window as any).stepToUpdate = step.id;
        // chrome.runtime.sendMessage(step);
    });

    const selectorsDivContnent = document.createElement("div");
    selectorsDivContnent.classList.add("selectors-content");

    selectors.forEach((selector, index) => {
        selectorsDivContnent.appendChild(getSelectorNode(index, selector.value));
    });

    div.appendChild(selectorsDivHeader);
    div.appendChild(selectorsDivContnent);

    return div;
};

const getElementSelectorIcon = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
    <path
        d="M4.5 17c-.417 0-.77-.146-1.062-.438A1.444 1.444 0 0 1 3 15.5h1.5V17ZM3 13.875v-1.5h1.5v1.5H3Zm0-3.125v-1.5h1.5v1.5H3Zm0-3.125v-1.5h1.5v1.5H3ZM3 4.5c0-.417.146-.77.438-1.062A1.444 1.444 0 0 1 4.5 3v1.5H3ZM6.125 17v-1.5h1.5V17h-1.5Zm0-12.5V3h1.5v1.5h-1.5ZM9 17V9h8v1.5h-5.438L17 15.938 15.938 17 10.5 11.562V17H9Zm.25-12.5V3h1.5v1.5h-1.5Zm3.125 0V3h1.5v1.5h-1.5Zm3.125 3V6H17v1.5h-1.5Zm0-3V3c.417 0 .77.146 1.062.438.292.291.438.645.438 1.062h-1.5Z"
        fill="#000"
    />
</svg>`;
};

const getTopRightIcon = (element: HTMLElement) => {
    const div = document.createElement("div");
    div.appendChild(element);
    div.classList.add("icon-top-right");
    return div;
};

const getMenuVerticalIcon = () => {
    const iconEle = document.createElement("div");
    iconEle.innerHTML = getMenuVerticalIconSvg();
    iconEle.classList.add("icon");
    return iconEle;
};

const getMenuVerticalIconSvg = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M10 16c-.417 0-.77-.146-1.062-.438A1.444 1.444 0 0 1 8.5 14.5c0-.417.146-.77.438-1.062A1.444 1.444 0 0 1 10 13c.417 0 .77.146 1.062.438.292.291.438.645.438 1.062 0 .417-.146.77-.438 1.062A1.444 1.444 0 0 1 10 16Zm0-4.5c-.417 0-.77-.146-1.062-.438A1.444 1.444 0 0 1 8.5 10c0-.417.146-.77.438-1.062A1.444 1.444 0 0 1 10 8.5c.417 0 .77.146 1.062.438.292.291.438.645.438 1.062 0 .417-.146.77-.438 1.062A1.444 1.444 0 0 1 10 11.5ZM10 7c-.417 0-.77-.146-1.062-.438A1.444 1.444 0 0 1 8.5 5.5c0-.417.146-.77.438-1.062A1.444 1.444 0 0 1 10 4c.417 0 .77.146 1.062.438.292.291.438.645.438 1.062 0 .417-.146.77-.438 1.062A1.444 1.444 0 0 1 10 7Z" fill="#000"/></svg>`;
};

const getDeleteIconSvgIcon = () => {
    const iconEle = document.createElement("div");
    iconEle.innerHTML = getDeleteIconSvg();
    iconEle.classList.add("icon");
    return iconEle;
};

const getDeleteIconSvg = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><path d="M6.5 17c-.417 0-.77-.146-1.062-.438A1.444 1.444 0 0 1 5 15.5v-10H4V4h4V3h4v1h4v1.5h-1v10c0 .417-.146.77-.438 1.062A1.444 1.444 0 0 1 13.5 17h-7Zm7-11.5h-7v10h7v-10ZM8 14h1.5V7H8v7Zm2.5 0H12V7h-1.5v7Z" fill="#000"/></svg>`;
};

const addUrl = (url: string) => {
    const stepsDivElement: HTMLDivElement | null = document.querySelector("#flow-steps");
    if (stepsDivElement) {
        stepsDivElement.classList.remove("steps-container");
        stepsDivElement.classList.add("steps-container");
        const div: HTMLDivElement = document.createElement("div");
        div.classList.add("step-test-container");
        div.classList.add("page-url");
        div.innerText = url;
        stepsDivElement.appendChild(div);
    }
};

(window as any)["addSteps"] = addSteps;
(window as any)["addStep"] = addStep;
(window as any)["updateStep"] = updateStep;
(window as any)["updateStepValue"] = updateStepValue;
(window as any)["deleteStep"] = deleteStep;

(window as any)["addTest"] = addTest;
(window as any)["updateTest"] = updateTest;
(window as any)["deleteTest"] = deleteTest;

(window as any)["addUrl"] = addUrl;
