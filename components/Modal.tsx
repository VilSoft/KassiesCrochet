import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ReactNode } from "react"
import { WhichOpen } from "./enums"
import { setAddPatternIsOpen, setIsPatternOpen } from "@/redux/features/patternListSlice"
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';

interface ModalProps {
    title: string,
    isOpen: boolean,
    type: WhichOpen,
    children?: ReactNode
}

export default function Modal( { title, children, isOpen, type }: ModalProps) {

    const dispatch = useDispatch<AppDispatch>();

    const handleOpenChange = () => {
        switch(type) {
            case WhichOpen.show:
                dispatch(setIsPatternOpen(false));
                break;
            case WhichOpen.add:
                dispatch(setAddPatternIsOpen(false));
                break;
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md overflow-y-scroll max-h-[90vh]" onInteractOutside={(e: any) => e.preventDefault()}>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                {children}
            </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}