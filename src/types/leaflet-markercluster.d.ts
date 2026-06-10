import "leaflet";

declare module "leaflet" {
  interface MarkerClusterGroupOptions {
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    disableClusteringAtZoom?: number;
  }

  class MarkerClusterGroup extends FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    clearLayers(): this;
    getBounds(): LatLngBounds;
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}

declare module "leaflet.markercluster" {
  export {};
}
