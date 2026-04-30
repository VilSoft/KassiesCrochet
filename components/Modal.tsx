import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { ReactNode } from 'react'
import { WhichOpen } from './enums'
import { setAddPatternIsOpen, setIsPatternOpen, setAddPdfPatternIsOpen } from '@/redux/features/patternListSlice'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import { cn } from '@/lib/utils'

interface ModalProps {
    title: string
    isOpen: boolean
    type: WhichOpen
    children?: ReactNode
}

export default function Modal({ title, children, isOpen, type }: ModalProps) {
    const dispatch = useDispatch<AppDispatch>()

    const handleOpenChange = () => {
        switch (type) {
            case WhichOpen.show:
                dispatch(setIsPatternOpen(false))
                break
            case WhichOpen.add:
                dispatch(setAddPatternIsOpen(false))
                break
            case WhichOpen.addPdf:
                dispatch(setAddPdfPatternIsOpen(false))
                break
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className={cn(
                    'overflow-y-auto max-h-[90vh]',
                    type === WhichOpen.show ? 'sm:max-w-4xl' : 'sm:max-w-lg'
                )}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}
