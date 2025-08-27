type level = "overworld" | "nether" | "end";

export class Event {
  private _id: string;
  private _data: Record<string, any>;

  constructor(data: Record<string, any> = {}) {
    this._id = Math.random().toString(36).substring(2, 15);
    this._data = data;
  }

  get id() {
    return this._id;
  }

  get data() {
    return this._data;
  }

  get name() {
    return this.constructor.name;
  }

  async send(url: string, apiKey: string) {
    await fetch(`http://${url}`, {
      method: "POST",
      body: JSON.stringify({
        type: this.name,
        data: {
          id: this.id,
          ...this.data,
        },
      }),
      headers: {
        "x-api-key": apiKey,
      }
    });
  }
}

export class BannerHeaderEvent extends Event {
  static everyone(header: string) {
    return new BannerHeaderEvent({
      header: header,
      reset: false,
    })
  }

  static reset(player: string) {
    return new BannerHeaderEvent({
      player,
      reset: true,
    })
  }

  static player(player: string, header: string) {
    return new BannerHeaderEvent({
      player,
      header,
      reset: false,
    })
  }
}

export class BannerFooterEvent extends Event {
  static everyone(footer: string) {
    return new BannerHeaderEvent({
      footer,
      reset: false,
    });
  }

  static reset(player: string) {
    return new BannerHeaderEvent({
      player,
      reset: true,
    });
  }

  static player(player: string, footer: string) {
    return new BannerHeaderEvent({
      player,
      footer,
      reset: false,
    });
  }
}

export class BannerNameEvent extends Event {
  static player(player: string, name: string) {
    return new BannerNameEvent({
      player,
      name,
    });
  }
}

export class BroadcastEvent extends Event {
  static message(message: string, override=true) {
    return new BroadcastEvent({
      message,
      override
    });
  }
}

export class DisableDimensionEvent extends Event {
  static dimension(dimension: level) {
    return new DisableDimensionEvent({
      dimension,
    });
  }
}


export class DisableElytraEvent extends Event {
  static dimension(dimension: level) {
    return new DisableElytraEvent({
      dimension,
    });
  }
}

export class EnableDimensionEvent extends Event {
  static dimension(dimension: level) {
    return new EnableDimensionEvent({
      dimension,
    });
  }
}

export class EnableElytraEvent extends Event {
  static dimension(dimension: level) {
    return new EnableElytraEvent({
      dimension,
    });
  }
}

export class KickEvent extends Event {
  static player(player: string) {
    return new KickEvent({
      player,
    });
  }

  static withReason(player: string, reason="You were kicked from the server") {
    return new KickEvent({
      player,
      reason,
    });
  }
}

export class KickKillServerEvent extends Event {
  static enable(reason = "") {
    return new KickKillServerEvent({ enable: true, reason });
  }

  static disable() {
    return new KickKillServerEvent({ enable: false });
  }
}


export class MessageEvent extends Event {
  static message(player: string, message: string, override = true) {
    return new BroadcastEvent({
      player,
      message,
      override,
    });
  }
}

export class NukeEvent extends Event {
  static enable(rate: number) {
    return new NukeEvent({ enable: true, rate });
  }

  static disable() {
    return new NukeEvent({ enable: false });
  }
}

export class StopEvent extends Event {
  static server() { return new StopEvent() }
}

export class TimeoutEvent extends Event {
  static timeout(player: string) {
    return new TimeoutEvent({
      player,
    });
  }

  static withReason(player: string, reason="You have been timed out", override=true) {
    return new TimeoutEvent({
      player,
      reason,
      override
    });
  }
}

export class TPEvent extends Event {
  static player(player: string, dimension: level, x: number, y: number, z: number, yaw: number, pitch: number) {
    return new TPEvent({
      player,
      dimension,
      x,
      y,
      z,
      yaw,
      pitch,
    });
  }
}

export class WarnEvent extends Event {
  static warn(player: string) {
    return new WarnEvent({
      player,
    });
  }

  static withReason(
    player: string,
    reason = "You have been warned",
    override = true,
  ) {
    return new WarnEvent({
      player,
      reason,
      override,
    });
  }
}

export class OpEvent extends Event {
  static op(player: string) {
    return new OpEvent({
      player,
    });
  }
}

export class DeOpEvent extends Event {
  static deop(player: string) {
    return new DeOpEvent({
      player,
    });
  }
}

export class HealEvent extends Event {
  static heal(player: string) {
    return new HealEvent({
      player,
    });
  }
}

export class FeedEvent extends Event {
  static feed(player: string) {
    return new FeedEvent({
      player,
    });
  }
}