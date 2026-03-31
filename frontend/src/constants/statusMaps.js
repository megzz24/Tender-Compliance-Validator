/* 
CAT_COLORS, STATUS_COLOR, RISK_COLOR, SEV_COLOR maps.
Maps category/status/risk strings to their hex colours.
*/
import { M } from "./colors"

export const CAT_COLORS = {
    Legal: M.mauve,
    Technical: M.blue,
    Financial: M.green,
    Operational: M.saph,
}

export const STATUS_COLOR = {
    Met: M.green,
    Partial: M.yell,
    Missing: M.red,
}

export const RISK_COLOR = {
    Low: M.green,
    Medium: M.yell,
    High: M.red,
}

export const SEV_COLOR = {
    High: M.red,
    Medium: M.peach,
    Low: M.yell,
}