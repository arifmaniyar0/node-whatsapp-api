import { Client, Message } from "whatsapp-web.js";

interface ISend_Message {
    status: boolean,
    message: Message | string
}

const send_message = async function(client: Client, number: any, _msg: string): Promise<ISend_Message> {
    try {
        var message = await client.sendMessage(`${number}@c.us`, _msg); // Send the message
        return {
            status: true,
            message
        }
    }
    catch(err: any) {
        return {
            status: false,
            message: err.message || 'Something Went Wrong. Please Check Your Whatsapp is Connected or Not!'
        }
    }
}

const is_registered_number = async function(client: Client, number: string): Promise<Boolean> {
    try {
        var mob = await client.getNumberId(number);
        if(mob) {
            return true
        }
        else {
            return false
        }
    }
    catch(err) {
        return false;
    }
}

const get_status = async function(client: Client): Promise<string> {
    return await client.getState();
}

const logout_client = async function(client: Client): Promise<void> {
    // try {
    //     await Promise.allSettled([client.logout(), client.destroy()]);
    // }
    // catch {}
    await client.logout();
    await client.destroy();
}

export {
    send_message,
    is_registered_number,
    get_status,
    logout_client
}