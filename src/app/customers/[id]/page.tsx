"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Table,
  Typography,
  Popconfirm,
  Space,
  Divider,
  Tag,
  Modal,
  AutoComplete,
  App,
  Tooltip,
  Avatar,
  Empty,
} from "antd";
import {
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  EyeOutlined,
  CalendarOutlined,
  PhoneOutlined,
  HomeOutlined,
  FileTextOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

interface Prescription {
  id: number;
  examined_date: string;
  ref_key: string;
  frame_name?: string;
  lense_name?: string;
  staff_name?: string;
  re_examinated_date?: string;
}

interface FamilyMember {
  id: number;
  fullname: string;
  phone_number: string;
}

interface CustomerData {
  id: number;
  fullname: string;
  dateofbirth: string;
  phone_number: string;
  address?: string;
  gender?: number;
  family_key?: string;
  prescriptions: Prescription[];
  familyMembers: FamilyMember[];
}

interface AutoCompleteOption {
  value: string;
  label: string;
  id: number;
}

export default function CustomerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [familySearchOptions, setFamilySearchOptions] = useState<
    AutoCompleteOption[]
  >([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [addingFamily, setAddingFamily] = useState(false);

  const fetchCustomer = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const data = await res.json();
      if (data.success) {
        setCustomer(data.data);
        form.setFieldsValue({
          fullname: data.data.fullname,
          dateofbirth: dayjs(data.data.dateofbirth),
          phone_number: data.data.phone_number,
          address: data.data.address,
          gender: data.data.gender,
        });
      } else {
        message.error("Không tìm thấy khách hàng");
        router.push("/dashboard");
      }
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [customerId, form, router, message]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleSave = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          dateofbirth: (values.dateofbirth as dayjs.Dayjs).format("YYYY-MM-DD"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Lưu thành công");
      } else {
        message.error(data.message);
      }
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleFamilySearch = async (value: string) => {
    if (value.length < 1) {
      setFamilySearchOptions([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/customers/search?q=${encodeURIComponent(value)}`,
      );
      const data = await res.json();
      if (data.success) {
        // Filter out current customer and existing family members
        const familyIds = customer?.familyMembers.map((m) => m.id) || [];
        setFamilySearchOptions(
          data.data
            .filter(
              (c: FamilyMember) =>
                c.id !== parseInt(customerId) && !familyIds.includes(c.id),
            )
            .map((c: FamilyMember) => ({
              value: c.fullname,
              label: `${c.fullname} - ${c.phone_number}`,
              id: c.id,
            })),
        );
      }
    } catch {
      /* ignore */
    }
  };

  const handleAddFamilyMember = async () => {
    if (!selectedMemberId) {
      message.warning("Vui lòng chọn thành viên");
      return;
    }
    setAddingFamily(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/family`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMemberId }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Đã thêm thành viên gia đình");
        setFamilyModalOpen(false);
        setSelectedMemberId(null);
        fetchCustomer();
      } else {
        message.error(data.message);
      }
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setAddingFamily(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        message.success("Đã xóa khách hàng");
        router.push("/dashboard");
      } else {
        message.error(data.message);
      }
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  const prescriptionColumns: ColumnsType<Prescription> = [
    {
      title: "Ngày khám",
      dataIndex: "examined_date",
      width: 130,
      render: (v) => (
        <Tag icon={<CalendarOutlined />} color="blue">
          {dayjs(v).format("DD/MM/YYYY")}
        </Tag>
      ),
    },
    {
      title: "Gọng kính",
      dataIndex: "frame_name",
      ellipsis: true,
      render: (v) =>
        v || (
          <Text type="secondary" italic>
            Chưa có
          </Text>
        ),
    },
    {
      title: "Tròng kính",
      dataIndex: "lense_name",
      ellipsis: true,
      render: (v) =>
        v || (
          <Text type="secondary" italic>
            Chưa có
          </Text>
        ),
    },
    {
      title: "Nhân viên",
      dataIndex: "staff_name",
      width: 120,
      render: (v) => v || <Text type="secondary">-</Text>,
    },
    {
      title: "Ngày tái khám",
      dataIndex: "re_examinated_date",
      width: 130,
      render: (v) =>
        v ? (
          <Tag color="orange">{dayjs(v).format("DD/MM/YYYY")}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết đơn thuốc">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              router.push(`/prescriptions/${record.id}`);
            }}
          >
            Chi tiết
          </Button>
        </Tooltip>
      ),
    },
  ];

  if (loading)
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Form form={form} className="hidden" />
      </MainLayout>
    );

  return (
    <MainLayout>
      {/* Header - Compact & Modern */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 shadow-sm border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/dashboard")}
              className="!rounded-lg"
            >
              Quay lại
            </Button>
            <div className="flex items-center gap-3">
              <Avatar
                size={56}
                icon={
                  customer?.gender === 1 ? <WomanOutlined /> : <ManOutlined />
                }
                className={
                  customer?.gender === 1 ? "bg-pink-500" : "bg-blue-600"
                }
              />
              <div>
                <Title level={3} className="!mb-1">
                  {customer?.fullname}
                </Title>
                <div className="flex items-center gap-3 text-sm">
                  <Text type="secondary">
                    <PhoneOutlined className="mr-1" />
                    {customer?.phone_number}
                  </Text>
                  <Tag color="blue">ID: {customer?.id}</Tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Info (Compact) */}
        <div className="lg:col-span-1 space-y-4">
          <Card
            title={
              <span className="flex items-center gap-2 text-base">
                <UserOutlined /> Thông tin cá nhân
              </span>
            }
            className="shadow-sm"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              size="middle"
            >
              <Form.Item
                name="fullname"
                label="Họ và tên"
                rules={[{ required: true }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  name="dateofbirth"
                  label="Ngày sinh"
                  rules={[{ required: true }]}
                >
                  <DatePicker format="DD/MM/YYYY" className="w-full" />
                </Form.Item>
                <Form.Item name="gender" label="Giới tính">
                  <Select
                    options={[
                      { value: 0, label: "Nam" },
                      { value: 1, label: "Nữ" },
                    ]}
                  />
                </Form.Item>
              </div>
              <Form.Item
                name="phone_number"
                label="Số điện thoại"
                rules={[{ required: true }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea rows={2} placeholder="Nhập địa chỉ..." />
              </Form.Item>
              <div className="flex gap-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  className="flex-1"
                >
                  Lưu
                </Button>
                <Popconfirm
                  title="Xác nhận xóa khách hàng?"
                  description="Hành động này không thể hoàn tác"
                  onConfirm={handleDelete}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Xóa
                  </Button>
                </Popconfirm>
              </div>
            </Form>
          </Card>

          {/* Family Members - Compact */}
          <Card
            title={
              <span className="flex items-center gap-2 text-base">
                <UsergroupAddOutlined /> Gia đình
                {customer?.familyMembers &&
                  customer.familyMembers.length > 0 && (
                    <Tag color="green">{customer.familyMembers.length}</Tag>
                  )}
              </span>
            }
            extra={
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setFamilyModalOpen(true)}
              >
                Thêm
              </Button>
            }
            className="shadow-sm"
          >
            {customer?.familyMembers && customer.familyMembers.length > 0 ? (
              <div className="space-y-2">
                {customer.familyMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-all border border-gray-100"
                    onClick={() => router.push(`/customers/${m.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar
                        size={32}
                        icon={<UserOutlined />}
                        className="bg-blue-500"
                      />
                      <div>
                        <Text strong className="text-sm">
                          {m.fullname}
                        </Text>
                        <Text type="secondary" className="block text-xs">
                          {m.phone_number}
                        </Text>
                      </div>
                    </div>
                    <Button type="link" icon={<EyeOutlined />} size="small" />
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có thành viên"
                className="!my-2"
              />
            )}
          </Card>
        </div>

        {/* Right Column - Prescription History (Priority) */}
        <div className="lg:col-span-2">
          <Card
            title={
              <span className="flex items-center gap-2 text-base">
                <FileTextOutlined /> Lịch sử đơn thuốc
                {customer?.prescriptions &&
                  customer.prescriptions.length > 0 && (
                    <Tag color="purple">
                      {customer.prescriptions.length} đơn
                    </Tag>
                  )}
              </span>
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  router.push(`/customers/${customerId}/prescriptions/new`)
                }
              >
                Tạo đơn mới
              </Button>
            }
            className="shadow-sm"
          >
            <Table
              columns={prescriptionColumns}
              dataSource={customer?.prescriptions || []}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: (t) => `Tổng ${t} đơn thuốc`,
              }}
              onRow={(record) => ({
                onDoubleClick: () => router.push(`/prescriptions/${record.id}`),
                className: "cursor-pointer hover:bg-blue-50 transition-colors",
              })}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có đơn thuốc nào"
                  />
                ),
              }}
            />
          </Card>
        </div>
      </div>

      {/* Modal thêm thành viên gia đình */}
      <Modal
        title="Thêm thành viên gia đình"
        open={familyModalOpen}
        onOk={handleAddFamilyMember}
        onCancel={() => {
          setFamilyModalOpen(false);
          setSelectedMemberId(null);
          setFamilySearchOptions([]);
        }}
        okText="Thêm"
        cancelText="Hủy"
        confirmLoading={addingFamily}
      >
        <div className="py-4">
          <Text className="block mb-2">Tìm kiếm khách hàng:</Text>
          <AutoComplete
            className="w-full"
            options={familySearchOptions}
            onSearch={handleFamilySearch}
            onSelect={(_, opt) => setSelectedMemberId(opt.id)}
            placeholder="Nhập tên khách hàng..."
          />
          {selectedMemberId && (
            <Text type="success" className="block mt-2">
              Đã chọn khách hàng ID: {selectedMemberId}
            </Text>
          )}
        </div>
      </Modal>
    </MainLayout>
  );
}
