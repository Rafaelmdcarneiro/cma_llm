import { Typography } from "@mui/material"
import { Handle, Position } from "reactflow"
import { PRIMARY_COLOR } from "../../../interfaces/interfaces"


interface Props
{
    id: "source-top" | "source-bottom" | "target-left" | "target-right"
    type: "source" | "target"
    handleOffset: number
    isSelected: boolean
    position: Position
    isHovered: boolean
}


const CustomHandle: React.FC<Props> = ({ id, type, handleOffset, isSelected, position, isHovered }): JSX.Element =>
{
    const handleText = type === "source" ? "s" : "t"

    return (
        <Handle
            id={id}
            type={type}
            position={position}
            style={{ [position]: `-${handleOffset}px`, background: isSelected ? PRIMARY_COLOR : "black" }}>
        
            { isHovered &&
                <Typography
                    fontSize="13px"
                    color={isSelected ? PRIMARY_COLOR : "black"}>
                        { handleText }
                </Typography>
            }

        </Handle>
    )
}

export default CustomHandle