export type StepAction = "click" | "keydown" | "keyup" | "change";
export type Selector = {
    value: string;
    shadowRoot: boolean;
};

export type FlowStepType = "ACTION" | "TEST" | "URL";

export type FlowStepRequest = {
    action: StepAction;
    selectors: Selector[];
    xpath?: string;
    xPosition?: number;
    yPosition?: number;
    value?: any;
    keyboardKey?: any;
};

export type FlowStep = FlowStepRequest & {
    type: FlowStepType;
    id: string;
};

export type A11yTest = {
    name: string;
    id: string;
    type: FlowStepType;
};

export type TestUrl = {
    url: string;
    type: FlowStepType;
};
