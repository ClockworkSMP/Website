import fs from "fs";
import { z } from "zod";
type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [member: string]: JSONValue };
type JSONArray = JSONValue[];

const schema = z.object({
  activeWhitelist: z.boolean(),
  maintenanceMode: z.boolean(),

  tps: z.number(),
  online: z.number(),
});

export class Config {
  private config: z.infer<typeof schema>;
  constructor(public path: string) {
    this.config = schema.parse(fs.readFileSync(path, "utf8"));
  }

  get activeWhitelist(): boolean {
    return this.config.activeWhitelist;
  }

  set activeWhitelist(value: boolean) {
    this.config.activeWhitelist = value;
    fs.writeFileSync(this.path, JSON.stringify(this.config, null, 4));
  }
  
  get maintenanceMode(): boolean {
    return this.config.maintenanceMode;
  }

  set maintenanceMode(value: boolean) {
    this.config.maintenanceMode = value;
    fs.writeFileSync(this.path, JSON.stringify(this.config, null, 4));
  }

  get tps(): number {
    return this.config.tps;
  }

  set tps(value: number) {
    this.config.tps = value;
    fs.writeFileSync(this.path, JSON.stringify(this.config, null, 4));
  }

  get online(): number {
    return this.config.online;
  }

  set online(value: number) {
    this.config.online = value;
    fs.writeFileSync(this.path, JSON.stringify(this.config, null, 4));
  }

  toRecord() {
    return {
      activeWhitelist: this.activeWhitelist,
      maintenanceMode: this.maintenanceMode,
    };
  }

  fromRecord(record: {activeWhitelist: boolean, maintenanceMode: boolean}) {
    this.activeWhitelist = record.activeWhitelist;
    this.maintenanceMode = record.maintenanceMode;
  }
}

export const configManager = new Config("./config.json")