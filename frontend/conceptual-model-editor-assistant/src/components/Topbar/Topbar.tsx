import Box from '@mui/material/Box';
import { Button, Divider } from "@mui/material";
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import { useRecoilState, useRecoilValue } from "recoil";
import { isSidebarCollapsedState, topbarTabValueState } from "../../atoms";
import SummaryDescriptionsTab from "./SummaryDescriptionsTab";
import SummaryPlainTextTab from "./SummaryPlainTextTab";
import TopbarButtons from "./ControlButtons";
import SettingsTab from "./SettingsTab";
import Tabs from "./Tabs";
import ImportTab from './ImportExportTab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useState } from 'react';
import InfoTab from './InfoTab';


const Topbar: React.FC = () =>
{
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(isSidebarCollapsedState)
    const tabValue = useRecoilValue(topbarTabValueState)

    const flexValue = isCollapsed ? 0 : 1

    
    const handleChangeSize = () =>
    {
        setIsCollapsed(previousValue => !previousValue)
    }

    const handleSidebarSize = () =>
    {
        setIsSidebarCollapsed(previousValue => !previousValue)
    }


    return (
        <Box sx={{ flex: flexValue }}>

            { !isCollapsed &&
                <Box sx={{ overflow: 'auto' }}>
                    <TabContext value={tabValue}>
                        
                        <Tabs/>

                        <TabPanel value="0">
                            <TopbarButtons/>
                        </TabPanel>

                        <TabPanel value="1">
                            <SummaryPlainTextTab/>
                        </TabPanel>

                        <TabPanel value="2">
                            <SummaryDescriptionsTab/>                    
                        </TabPanel>

                        <TabPanel value="3">
                            <ImportTab/>
                        </TabPanel>

                        <TabPanel value="4">
                            <SettingsTab/>
                        </TabPanel>

                        <TabPanel value="5">
                            <InfoTab/>
                        </TabPanel>
                    </TabContext>
                </Box>
            }

            <Button
                variant="contained"
                color="inherit"
                size="small"
                sx={{ position: "absolute", left:"40px", top: "10px", zIndex: 1}}
                onClick={ handleChangeSize }>
                    { isCollapsed ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/> }
            </Button>

            <Button
                variant="contained"
                color="inherit"
                size="small"
                sx={{ position: "absolute", left:`120px`, top: "10px", zIndex: 1}}
                onClick={ handleSidebarSize }>
                    { isSidebarCollapsed ? <KeyboardArrowLeftIcon/> : <KeyboardArrowRightIcon/> }
            </Button>
        </Box>
    )
}

export default Topbar