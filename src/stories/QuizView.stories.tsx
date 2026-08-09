import type { Meta, StoryObj } from "@storybook/react";
import { QuizView } from "../components/QuizView";

const meta: Meta<typeof QuizView> = {
    title: "Components/QuizView",
    component: QuizView,
    parameters: {
        layout: "padded"
    }
};

export default meta;
type Story = StoryObj<typeof QuizView>;

export const Default: Story = {
    render: () => <QuizView />
};
