import React from 'react';
import Navbar from '../components/Navbar';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQ = () => {
  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Frequently Asked Questions (FAQ)
        </Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>How do I create an invoice?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              To create an invoice, navigate to the "Create Invoice" page, fill in the required details, and click the "Create Invoice" button. You can then download the invoice as a PDF or send it via email.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>How can I edit an existing invoice?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              To edit an existing invoice, go to the "Dashboard" page, click on the invoice you want to edit, and then click the "Edit" button. Make the necessary changes and save the invoice.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>How do I delete an invoice?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              To delete an invoice, go to the "Dashboard" page, click on the invoice you want to delete, and then click the "Delete" button. Confirm the deletion in the dialog that appears.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>How can I send an invoice via email?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              After creating an invoice, you can send it via email by clicking the "Send Email" button on the invoice details page. Ensure that the client's email address is correctly entered.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>How do I download an invoice as a PDF?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              To download an invoice as a PDF, go to the invoice details page and click the "Download as PDF" button. The PDF will be generated and downloaded to your device.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>What should I do if I encounter an error?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              If you encounter an error, please check the console for error messages and try again. If the issue persists, contact support for further assistance.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Container>
    </>
  );
};

export default FAQ;