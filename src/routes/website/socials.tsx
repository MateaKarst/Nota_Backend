// src/routes/website/socials.tsx
import express from 'express';
import { getAllSocials } from '../handlers/socialsHandler';

const router = express.Router();

// Route to get all socials (no user verification needed)
router.get('/', async (req, res) => {
    try {
        const socials = await getAllSocials(); // Get the socials data
        console.log("socialsWebsite", "getAllSocials", socials)
        res.status(200).json(socials); // Return the data
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching socials' });
    }
});

export default router;
