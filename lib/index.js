import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, Platform } from "react-native";
import * as utils from "./utils";
import { Gesture, GestureDetector, State } from "react-native-gesture-handler";
export const ReactNativeJoystick = ({ onStart, onMove, onStop, color = "#000000", radius = 150, style, nippleRatio = 3, children, ...props }) => {
    const wrapperRadius = radius;
    const nippleRadius = wrapperRadius / nippleRatio;
    const [x, setX] = useState(wrapperRadius - nippleRadius);
    const [y, setY] = useState(wrapperRadius - nippleRadius);
    const handleUpdate = useCallback((event) => {
        const offset = wrapperRadius - nippleRadius;
        let dist = utils.calcDistance({ x: 0, y: 0 }, { x: event.translationX, y: event.translationY });
        const angle = utils.calcAngle({ x: event.translationX, y: event.translationY }, { x: 0, y: 0 });
        const rads = utils.degreesToRadians(angle);
        const force = dist / (nippleRadius * 2);
        let coordinates;
        if (dist >= wrapperRadius) {
            coordinates = {
                x: wrapperRadius * Math.cos(rads),
                y: wrapperRadius * Math.sin(rads)
            };
        }
        else {
            coordinates = {
                x: dist * Math.cos(rads),
                y: dist * Math.sin(rads)
            };
        }
        setX(coordinates.x + offset);
        setY(coordinates.y + offset);
        if (event.state === State.ACTIVE && onMove)
            onMove({
                position: {
                    x: coordinates.x,
                    y: -coordinates.y
                },
                angle: {
                    radian: rads,
                    degree: angle
                },
                force,
                type: "move"
            });
    }, [nippleRadius, wrapperRadius]);
    const handleTouchEnd = () => {
        setX(wrapperRadius - nippleRadius);
        setY(wrapperRadius - nippleRadius);
        onStop &&
            onStop({
                force: 0,
                position: {
                    x: 0,
                    y: 0
                },
                angle: {
                    radian: 0,
                    degree: 0
                },
                type: "stop"
            });
    };
    const handleTouchStart = () => {
        onStart &&
            onStart({
                force: 0,
                position: {
                    x: 0,
                    y: 0
                },
                angle: {
                    radian: 0,
                    degree: 0
                },
                type: "start"
            });
    };
    const panGesture = Gesture.Pan().onStart(handleTouchStart).onEnd(handleTouchEnd).onUpdate(handleUpdate);
    const styles = useMemo(() => StyleSheet.create({
        wrapper: {
            width: 2 * radius,
            height: 2 * radius,
            borderRadius: radius,
            backgroundColor: `${color}55`,
            ...(style && typeof style === "object" ? style : {})
        },
        nipple: {
            height: 2 * nippleRadius,
            width: 2 * nippleRadius,
            borderRadius: nippleRadius,
            backgroundColor: `${color}bb`,
            position: "absolute",
            zIndex: 2,
            transform: [
                { translateX: x },
                { translateY: y }
            ]
        }
    }), [radius, color, nippleRadius, x, y]);
    return (<View style={styles.wrapper} {...props}>
      {children}
      <GestureDetector gesture={panGesture}>
        <View pointerEvents="none" style={styles.nipple}></View>
      </GestureDetector>
    </View>);
};
//# sourceMappingURL=index.js.map