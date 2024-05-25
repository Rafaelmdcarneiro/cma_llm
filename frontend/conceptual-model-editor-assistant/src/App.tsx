import ConceptualModel from './components/ConceptualModel/ConceptualModel';
import Topbar from './components/Topbar/Topbar'
import SideBar from './components/Sidebar/Sidebar';
import { ReactFlowProvider } from 'reactflow';
import HighlightDialog from './components/DialogDomainDescription/DialogDomainDescription';
import DialogCreateEdge from './components/DialogCreateEdge';
import { RecoilRoot } from 'recoil';
import DialogEditItem from './components/DialogEditItem/DialogEditItem';
import { Box, Stack } from '@mui/material';


function App()
{
  return (
    <RecoilRoot>

      <Stack direction="row" sx={{ width: "100hh", height: "100vh"}}>

      <Box sx={{ flex: 4 }}>
        <Stack sx={{ width: "100%", height: "100%" }}>

          <Topbar/>
          
          <ReactFlowProvider>
            <ConceptualModel/>
          </ReactFlowProvider>

        </Stack>
      </Box>

        <SideBar/>
      </Stack>

      <HighlightDialog/>

      <DialogEditItem/>

      <DialogCreateEdge/>
    </RecoilRoot>
  )
}


export default App