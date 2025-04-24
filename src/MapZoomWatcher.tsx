import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { layerConfigChange } from "@kepler.gl/actions";

type ZoomRule = {
  label: string;
  showIfZoomBelow?: number;
  showIfZoomAbove?: number;
};

export const MapZoomWatcher = ({ dispatch }: { dispatch: any }) => {
  const defaultZoom = 0;

  // Aturan zoom, urutkan dari yang paling spesifik ke paling umum
  const zoomLayerRules: ZoomRule[] = [
    { label: "Hex11_all_fix.geojson", showIfZoomAbove: 13 },
    { label: "Hex10_all_fix.geojson", showIfZoomAbove: 11.5 },
    { label: "Hex9_all_fix.geojson", showIfZoomAbove: 10 },
    { label: "Hex8_all_fix.geojson", showIfZoomBelow: 10 },
  ];

  const zoom = useSelector(
    (state: any) => state.keplerGl?.["map"]?.mapState?.zoom ?? defaultZoom
  );

  const layers: any[] = useSelector(
    (state: any) => state.keplerGl?.["map"]?.visState?.layers || []
  );

  const prevZoom = useRef(zoom);

  useEffect(() => {
    if (zoom === prevZoom.current || layers.length === 0) return;

    console.log("zoom:", zoom);

    // Cari rule pertama yang cocok dengan zoom saat ini
    const matchingRule = zoomLayerRules.find((rule) => {
      const below =
        rule.showIfZoomBelow !== undefined && zoom < rule.showIfZoomBelow;
      const above =
        rule.showIfZoomAbove !== undefined && zoom > rule.showIfZoomAbove;
      return below || above;
    });

    layers.forEach((layer) => {
      const isTarget =
        matchingRule && layer.config.label === matchingRule.label;
      const shouldBeVisible = !!isTarget;

      if (layer.config.isVisible !== shouldBeVisible) {
        dispatch(
          layerConfigChange(layer, {
            isVisible: shouldBeVisible,
          })
        );
      }
    });

    prevZoom.current = zoom;
  }, [zoom, layers, dispatch]);

  return null;
};
