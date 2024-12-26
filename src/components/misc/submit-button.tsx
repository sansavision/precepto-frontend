// SubmitButton.tsx
import { Loader2 } from "lucide-react"; // Using Loader2 for a spinning loader icon
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleAction: () => Promise<void>; // Expecting an async function
    disabled?: boolean;
    deleteMode?: boolean;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
    title,
    handleAction,
    deleteMode = false,
    disabled = false,
    variant = "default"
    
}) => {
    const [isLoading, setIsLoading] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const onClick = async (e:any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        e.preventDefault();
        setIsLoading(true);
        try {
            await handleAction();
        } catch (error) {
            // Handle error appropriately
            console.error("Submit action failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
        variant={variant}
            className={cn("flex gap-x-4",
                deleteMode ? "hover:bg-destructive" : "hover:bg-primary"
            )}
            onClick={e => onClick(e)}
            disabled={isLoading || disabled}
        >
            {isLoading ? <Loader2 className="animate-spin" /> : null}
            {title}
        </Button>
    );
};
