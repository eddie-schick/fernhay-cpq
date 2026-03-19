/* eslint-disable import/named */
import { Image, Text, View } from "@react-pdf/renderer";
import { Style } from "@react-pdf/types";

import { PropsWithChildren } from "react";

import { POWERED_BY_SHAED_TEXT } from "~/constants/constants";

import { SheadLogoPng27x32 } from "~/global/icons";

export const CustomText = (props: PropsWithChildren & { style?: Style }) => {
  return (
    <Text style={{ fontSize: 12, ...(props?.style || {}) }}>
      {props.children}
    </Text>
  );
};

export const BoldText = (props: PropsWithChildren & { style?: Style }) => {
  return (
    <Text
      style={{
        fontWeight: 700,
        fontFamily: "Roboto",
        fontSize: 12,
        ...(props?.style || {}),
      }}
    >
      {props.children}
    </Text>
  );
};

export const Margin2Top = () => {
  return (
    <View
      style={{
        marginTop: 2,
      }}
    ></View>
  );
};
export const Margin4Top = () => {
  return (
    <View
      style={{
        marginTop: 4,
      }}
    ></View>
  );
};
export const Margin8Top = () => {
  return (
    <View
      style={{
        marginTop: 8,
      }}
    ></View>
  );
};
export const Margin12Top = () => {
  return (
    <View
      style={{
        marginTop: 12,
      }}
    ></View>
  );
};
export const Margin16Top = () => {
  return (
    <View
      style={{
        marginTop: 16,
      }}
    ></View>
  );
};
export const Margin20Top = () => {
  return (
    <View
      style={{
        marginTop: 20,
      }}
    ></View>
  );
};

export const Margin2Bottom = () => {
  return (
    <View
      style={{
        marginBottom: 2,
      }}
    ></View>
  );
};
export const Margin4Bottom = () => {
  return (
    <View
      style={{
        marginBottom: 4,
      }}
    ></View>
  );
};
export const Margin8Bottom = () => {
  return (
    <View
      style={{
        marginBottom: 8,
      }}
    ></View>
  );
};
export const Margin12Bottom = () => {
  return (
    <View
      style={{
        marginBottom: 12,
      }}
    ></View>
  );
};
export const Margin16Bottom = () => {
  return (
    <View
      style={{
        marginBottom: 16,
      }}
    ></View>
  );
};
export const Margin20Bottom = () => {
  return (
    <View
      style={{
        marginBottom: 20,
      }}
    ></View>
  );
};

export const ShaedFooter = () => {
  return (
    <View
      style={{
        marginTop: "auto",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
        backgroundColor: "#FEFEFE",
        borderTopColor: "#E6E6E6",
        borderTopWidth: 1,
        borderTopStyle: "solid",
        marginLeft: -30,
        marginRight: -30,
      }}
    >
      <Image
        src={SheadLogoPng27x32}
        style={{
          marginRight: 12,
          height: 16,
          width: 16,
        }}
      />

      <CustomText
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          color: "#646464",
          fontSize: 10,
          fontWeight: 500,
        }}
      >
        {POWERED_BY_SHAED_TEXT}
      </CustomText>
    </View>
  );
};
