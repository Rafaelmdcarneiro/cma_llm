import { Box, Button, Tab } from "@mui/material"
import { topbarTabValueState } from "../../atoms"
import { useSetRecoilState } from "recoil"
import { TabList } from "@mui/lab"
import { SUMMARY_DESCRIPTIONS_NAME, SUMMARY_PLAIN_TEXT_NAME } from "../../utils/utility"
import { TopbarTabs } from "../../interfaces/interfaces"


const Tabs: React.FC = (): JSX.Element =>
{
    const setTabValue = useSetRecoilState(topbarTabValueState)


    const handleChange = (event: React.SyntheticEvent, newValue: string) =>
    {
        setTabValue(newValue)
    }


    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent:"center" }}>
            <TabList onChange={ handleChange }>
                <Tab sx={{textTransform: "none"}} label="Main" value={TopbarTabs.MAIN} />
                <Tab sx={{textTransform: "none"}} label={SUMMARY_PLAIN_TEXT_NAME} value={TopbarTabs.SUMMARY_PLAIN_TEXT} />
                <Tab sx={{textTransform: "none"}} label={SUMMARY_DESCRIPTIONS_NAME} value={TopbarTabs.SUMMARY_DESCRIPTION} />
                <Tab sx={{textTransform: "none"}} label="Import & Export" value={TopbarTabs.IMPORT_EXPORT} />
                <Tab sx={{textTransform: "none"}} label="Settings" value={TopbarTabs.SETTINGS} />
                <Tab sx={{textTransform: "none"}} label="Report bug" value={TopbarTabs.INFO} />
            </TabList>
        </Box>
    )
}

export default Tabs