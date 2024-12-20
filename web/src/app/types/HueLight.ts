export type BridgeInfo = {
  id: string;
  internalipaddress: string;
  port: number;
};

export type LightType = 'color' | 'white' | 'whiteAmbiance';

type Xy = {
  x: number;
  y: number;
};
type HueResourceType =
  | 'behavior_instance'
  | 'behavior_script'
  | 'bridge'
  | 'bridge_home'
  | 'device'
  | 'device_software_update'
  | 'entertainment'
  | 'entertainment_configuration'
  | 'geolocation'
  | 'grouped_light'
  | 'homekit'
  | 'light'
  | 'matter'
  | 'room'
  | 'scene'
  | 'zigbee_connectivity'
  | 'zigbee_device_discovery'
  | 'zone';

type EffectValues = 'no_effect' | 'candle' | 'fire' | 'prism' | 'sparkle' | 'opal' | 'glisten';

export type Light = {
  // v1
  // capabilities: {
  //   control: {
  //     colorgamut?: boolean;
  //   };
  // };
  // config: {
  //   archetype: string;
  // };
  // state: {
  //   on: boolean;
  //   bri: number;
  //   xy?: [number, number];
  //   ct: number;
  // };
  // name: string;

  // v2
  id: string;
  id_v1: string;
  owner: {
    rid: string;
    rtype: 'device';
  };
  metadata: {
    name: string;
    archetype: 'sultan_bulb' | 'candle_bulb' | 'hue_lightstrip';
    function: 'mixed' | 'decorative';
  };
  product_data: {
    function: 'mixed' | 'decorative';
  };
  identify: object;
  service_id: number;
  on: {
    on: boolean;
  };
  dimming: {
    brightness: number;
    min_dim_level: number;
  };
  dimming_delta: object;
  color_temperature: {
    mirek: number;
    mirek_valid: boolean;
    mirek_schema: {
      mirek_minimum: number;
      mirek_maximum: number;
    };
  };
  color_temperature_delta?: object;
  color?: {
    xy: Xy;
    gamut: {
      red: Xy;
      green: Xy;
      blue: Xy;
    };
    gamut_type: 'C';
  };
  dynamics: {
    status: 'none';
    status_values: ('none' | 'dynamic_palette')[];
    speed: number;
    speed_valid: boolean;
  };
  alert: {
    action_values: {
      0: 'breathe';
    };
  };
  signaling: {
    signal_values: ('no_signal' | 'on_off' | 'on_off_color' | 'alternating')[];
  };
  mode: 'normal';
  effects: {
    status_values: EffectValues[];
    status: 'no_effect';
    effect_values: EffectValues[];
  };
  effects_v2: {
    action: {
      effect_values: EffectValues[];
    };
    status: {
      effect: 'no_effect';
      effect_values: EffectValues[];
    };
  };
  powerup: {
    preset: 'custom';
    configured: boolean;
    on: {
      mode: 'on';
      on: {
        on: boolean;
      };
    };
    dimming: {
      mode: 'dimming';
      dimming: {
        brightness: number;
      };
    };
    color: {
      mode: 'color_temperature';
      color_temperature: {
        mirek: number;
      };
    };
  };
  type: HueResourceType;
};

export type Lights = {
  data: Light[];
};

export type GetLightsInfo = () => Promise<Lights>;
