import { supply } from '@/interfaces';
import {Schema, model, models} from 'mongoose';

const patternSchema = new Schema({
    name: { type: String, required: true},
    supplies: { type: Array<supply>, required: true },
    instructions: { type: Array<String>, required: true },
    image: { type: Array<String>, required: false }
})

const Pattern = models.Pattern || model('Pattern', patternSchema);

export default Pattern;