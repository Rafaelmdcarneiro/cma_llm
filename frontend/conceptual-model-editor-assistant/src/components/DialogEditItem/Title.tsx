import { Item } from "../../interfaces/interfaces"
import Typography from '@mui/material/Typography';


interface Props
{
    item: Item
}

const Title: React.FC<Props> = ({ item}) =>
{
    return (
        <Typography variant="h5" component="span">
            Editing {item.type}: <strong>{item.name}</strong>
        </Typography>
    )
}
    
export default Title