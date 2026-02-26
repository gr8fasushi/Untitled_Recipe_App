import { View } from 'react-native';
import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps): React.JSX.Element {
  return <View className={`flex-1 w-full max-w-2xl self-center ${className}`}>{children}</View>;
}
