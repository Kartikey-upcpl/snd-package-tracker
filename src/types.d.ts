type TUser = {
    _id: string,
    username: string,
    name: string,
    role: "root" | "manager" | "admin" | "executive",
    created_at: Date,
    updated_at: Date
}

type TPackage = {
    _id: string,
    package_id: string,
    status: string,
    courier: string,
    channel: string,
    type: "incoming" | "outgoing",
    cancelled: boolean,
    executive: string,
    task: string,
    remarks: string,
    created_at: Date,
    updated_at: Date
}

type TTask = {
    _id: string,
    task_id: string,
    type: "incoming" | "outgoing",
    is_open: boolean,
    courier: string,
    channel: string,
    vehicle_no: string,
    packages: string[],
    delex_name: string,
    delex_contact: string,
    created_by: string,
    updated_by: string,
    created_at: Date,
    updated_at: Date
};

type TPackagePopulated = {
    executive: {
        name: string,
        username: string
    }
    task: TTask
} & TPackage;

type TTaskPopulated = {
    _id: string,
    task_id: string,
    type: "incoming" | "outgoing",
    is_open: boolean,
    courier: string,
    channel: string,
    vehicle_no: string,
    delex_name: string,
    delex_contact: string,
    updated_by: string,
    created_at: Date,
    updated_at: Date
    packages: TPackagePopulated[],
    created_by: {
        name: string,
        username: string
    }
};
