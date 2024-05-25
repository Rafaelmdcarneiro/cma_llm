import { Checkbox, Divider, FormControlLabel, FormLabel, Radio, RadioGroup, Slider, Stack, Typography } from "@mui/material"
import { useRecoilState } from "recoil"
import { isIgnoreDomainDescriptionState, textFilteringVariationState } from "../../atoms"
import { TextFilteringVariation } from "../../interfaces/interfaces"


const SettingsTab: React.FC = (): JSX.Element =>
{
    const [isIgnoreDomainDescription, setIsIgnoreDomainDescription] = useRecoilState(isIgnoreDomainDescriptionState)
    const [textFilteringVariation, setTextFilteringVariation] = useRecoilState(textFilteringVariationState)


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        const newTextFilteringVariation = event.target.value as TextFilteringVariation
        setTextFilteringVariation(newTextFilteringVariation)
    }


    return (
        <Stack sx={{width: "100%", height: "100%"}}>
            <FormControlLabel label="Ignore domain description"
                control={
                    <Checkbox
                        checked={isIgnoreDomainDescription}
                        onChange={() => setIsIgnoreDomainDescription(previousValue => !previousValue)}/>
                }/>

            <p></p>
            <Divider></Divider>
            <p></p>

            
            <FormLabel> Domain description filtering </FormLabel>
            <RadioGroup row onChange={ handleChange } value={textFilteringVariation}>
                <FormControlLabel value={TextFilteringVariation.NONE} control={<Radio />} label={TextFilteringVariation.NONE} />
                <FormControlLabel value={TextFilteringVariation.SEMANTIC} control={<Radio />} label={TextFilteringVariation.SEMANTIC} />
                <FormControlLabel value={TextFilteringVariation.SYNTACTIC} control={<Radio />} label={TextFilteringVariation.SYNTACTIC} />
            </RadioGroup>
            
            {/* <p></p>
            <Divider></Divider>
            <p></p> */}
        </Stack>
    )
}

export default SettingsTab