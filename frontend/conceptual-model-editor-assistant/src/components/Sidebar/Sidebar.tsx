import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isSidebarCollapsedState, sidebarTabValueState, sidebarTitlesState, suggestedAttributesState, suggestedClassesState, suggestedAssociationsState } from '../../atoms';
import { Box, Divider } from '@mui/material';
import { ItemType } from '../../interfaces/interfaces';
import { TabContext, TabList, TabPanel } from "@mui/lab"
import Tabs from "./Tabs";
import Suggestions from './Suggestions';


const Sidebar: React.FC = () =>
{
    const isCollapsed = useRecoilValue(isSidebarCollapsedState)

    const entities = useRecoilValue(suggestedClassesState)
    const attributes = useRecoilValue(suggestedAttributesState)
    const relationships = useRecoilValue(suggestedAssociationsState)

    const tabValue = useRecoilValue(sidebarTabValueState)

    const sidebarTitles = useRecoilValue(sidebarTitlesState)

    if (isCollapsed)
    {
        return <></>
    }


    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', '& .MuiTabPanel-root': { paddingX: "0px", marginX: "3px" } }}>

            <Divider orientation="vertical" />
            
            <Box sx={{ flex: 1 }}>
                <TabContext value={tabValue}>
                    <Tabs/>

                    <TabPanel value="0">
                        <Suggestions items={entities} title={sidebarTitles.classes} itemType={ItemType.CLASS}/>
                    </TabPanel>

                    <TabPanel value="1">
                        <Suggestions items={attributes} title={sidebarTitles.attributes} itemType={ItemType.ATTRIBUTE}/>
                    </TabPanel>

                    <TabPanel value="2">
                        <Suggestions items={relationships} title={sidebarTitles.associations} itemType={ItemType.ASSOCIATION}/>
                    </TabPanel>
                </TabContext>
            </Box>
        </Box>
    )
}

export default Sidebar