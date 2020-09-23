import React from "react";
import { Page, Text, View, Document } from "@react-pdf/renderer";

export function PDF(props) {
  return (
    <Document>
      <Page>
        <View></View>
      </Page>
    </Document>
  );
}
