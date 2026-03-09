import { supabase } from './services/supabaseClient';

async function main() {
    const { data, error } = await supabase.from('experts').select('*');
    if (error) {
        console.error(error);
        return;
    }

    const thiago = data.find(e => e.name.toLowerCase().includes('thiago'));
    const edenilza = data.find(e => e.name.toLowerCase().includes('edenilza'));

    console.log('Thiago:', thiago);
    console.log('Edenilza:', edenilza);

    const thiagoSupervised = data.filter(e => e.supervisor === 'Thiago da Silva Nascimento');
    console.log('Supervised by Thiago:', thiagoSupervised.map(e => e.name));
}

main();
