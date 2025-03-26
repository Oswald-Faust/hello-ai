import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ReactNode } from 'react';

interface DialogProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Dialog({ children, isOpen, onClose }: DialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>{children}</ModalContent>
    </Modal>
  );
}

export function DialogTrigger({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function DialogContent({ children }: { children: ReactNode }) {
  return <ModalBody>{children}</ModalBody>;
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <ModalHeader>{children}</ModalHeader>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <ModalFooter>{children}</ModalFooter>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <ModalHeader>{children}</ModalHeader>;
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return <ModalBody>{children}</ModalBody>;
}

export default Dialog; 