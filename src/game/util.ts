
import * as ex from "excalibur"

export function isPosIn(pos: ex.Vector, list: ex.Vector[]): boolean
{
	for (let i = 0; i < list.length; i++)
	{
		if (pos.equals(list[i])) { return true }
	}
	return false
}
