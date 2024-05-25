import { Box, Tab } from "@mui/material"
import { sidebarErrorMsgState, sidebarTabValueState } from "../../atoms"
import { useSetRecoilState } from "recoil"
import { TabList } from "@mui/lab"
import { SidebarTabs, UserChoice } from "../../interfaces/interfaces"
import { capitalizeString } from "../../utils/utility"


const Tabs: React.FC = (): JSX.Element =>
{
    const setTabValue = useSetRecoilState(sidebarTabValueState)
    const setErrorMessage = useSetRecoilState(sidebarErrorMsgState)

    const entitiesLabel = capitalizeString(UserChoice.CLASSES)
    const attributesLabel = capitalizeString(UserChoice.ATTRIBUTES)
    const associationsLabel = capitalizeString(UserChoice.ASSOCIATIONS_ONE_KNOWN_CLASS).slice(0, -1)

    const handleChange = (event: React.SyntheticEvent, newValue: string) =>
    {
        setErrorMessage("")
        setTabValue(newValue)
    }


    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent:"center" }}>
            <TabList onChange={ handleChange }
                indicatorColor="secondary"
                textColor="secondary">
                    <Tab sx={{textTransform: "capitalize"}} label={entitiesLabel} value={SidebarTabs.CLASSES} />
                    <Tab sx={{textTransform: "none"}} label={attributesLabel} value={SidebarTabs.ATTRIBUTES} />
                    <Tab sx={{textTransform: "none"}} label={associationsLabel} value={SidebarTabs.ASSOCIATIONS}/>
            </TabList>
        </Box>
    )
}

export default Tabs