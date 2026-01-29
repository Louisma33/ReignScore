import { Link, LinkProps } from 'expo-router';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface SafeLinkProps extends LinkProps {
    style?: ViewStyle | ViewStyle[];
    children: React.ReactNode;
}

export function SafeLink({ style, children, asChild, ...props }: SafeLinkProps) {
    const flatStyle = StyleSheet.flatten(style);

    if (asChild && React.isValidElement(children)) {
        return (
            <Link {...props} asChild>
                {React.cloneElement(children, {
                    style: StyleSheet.flatten([children.props.style, flatStyle]),
                } as any)}
            </Link>
        );
    }

    return (
        <Link {...props} style={flatStyle}>
            {children}
        </Link>
    );
}
