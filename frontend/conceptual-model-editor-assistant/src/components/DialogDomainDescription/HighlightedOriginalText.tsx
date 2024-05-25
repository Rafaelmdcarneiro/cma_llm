import { useRecoilValue } from "recoil"
import { domainDescriptionState, originalTextIndexesListState, tooltipsState } from "../../atoms"
import { Typography, styled } from "@mui/material"
import Tooltip, { TooltipProps, tooltipClasses  } from '@mui/material/Tooltip';
import { ORIGINAL_TEXT_ID } from "../../utils/utility";


const HighlightedOriginalText: React.FC = (): JSX.Element =>
{
    const domainDescription = useRecoilValue(domainDescriptionState)
  
    const originalTextIndexes = useRecoilValue(originalTextIndexesListState)
    const tooltips = useRecoilValue(tooltipsState)
    
    let lastStop = 0
    let texts = []

    for (let i = 0; i < originalTextIndexes.length; i += 2)
    {
        const highightedTextStart = originalTextIndexes[i]
        const highightedTextEnd = originalTextIndexes[i + 1]

        texts.push(domainDescription.slice(lastStop, highightedTextStart))
        texts.push(domainDescription.slice(highightedTextStart, highightedTextEnd))
        lastStop = originalTextIndexes[i + 1]
    }

    texts.push(domainDescription.slice(lastStop)) // Append the remaining part of the text

    // Define a styled span component
    const HoverSpan = styled('span')(() => ({ transition: 'background 0.3s ease', '&:hover': { background: "#77dae6" }, }))

    // Tooltip from https://mui.com/material-ui/react-tooltip/#customization
    const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
        <Tooltip {...props} classes={{ popper: className }} />
        ))(() => ({
        [`& .${tooltipClasses.tooltip}`]:
        {
        backgroundColor: '#6d6d6d',
        color: '#ffffff',
        maxWidth: "100%",
        },
    }))


    const getTooltip = (index : number) =>
    {
        const labelIndex = (index - 1) / 2
        return tooltips[labelIndex]
    }


    return (
        <Typography component='span' whiteSpace="pre-wrap">
            { texts.map((text, index) =>
            (
                index % 2 === 0 ? <span key={index}>{text}</span> :
                <HtmlTooltip title={<Typography color="inherit">{ getTooltip(index) }</Typography>} arrow key={index}>
                  <HoverSpan
                    id={`${ORIGINAL_TEXT_ID}-${index}`}
                    className="highlight"
                    key={index}
                  >
                    {text}
                  </HoverSpan>
                </HtmlTooltip>
            ))}
        </Typography>
    )
}

export default HighlightedOriginalText