import { Typography } from "@mui/material"


const InfoTab: React.FC = (): JSX.Element =>
{
    return (
        <>
            <Typography>
                If you have any issues please let us know on our <a href="https://github.com/Dominik7131/Conceptual-Modeling-LLM-Assistant/issues" target="_blank" rel="noopener noreferrer">GitHub page</a>.
            </Typography>

            <br />

            <Typography>
                Known issues:

                <li> "Summary: descriptions" does not stick to the provided classes, attributes and associations </li>
            </Typography>
        </>
    )
}

export default InfoTab